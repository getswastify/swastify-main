"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
  ResultReason,
} from "microsoft-cognitiveservices-speech-sdk";
import api from "@/lib/axios";

export default function VoiceAgent() {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const synthesizerRef = useRef<SpeechSynthesizer | null>(null);
  const speechConfigRef = useRef<SpeechConfig | null>(null);
  const isSpeakingRef = useRef(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  // Initialize Azure Speech SDK
  useEffect(() => {
    const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!;
    const serviceRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!;

    if (!speechKey || !serviceRegion) {
      setError("Azure Speech key or region missing.");
      return;
    }

    const speechConfig = SpeechConfig.fromSubscription(speechKey, serviceRegion);
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();

    speechConfigRef.current = speechConfig;
    recognizerRef.current = new SpeechRecognizer(speechConfig, audioConfig);
    synthesizerRef.current = new SpeechSynthesizer(speechConfig);

    return () => {
      recognizerRef.current?.close();
      synthesizerRef.current?.close();
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const stopSpeaking = () => {
    if (synthesizerRef.current && isSpeakingRef.current) {
      synthesizerRef.current.close();
      isSpeakingRef.current = false;
      // Re-initialize synthesizer for further use
      if (speechConfigRef.current) {
        synthesizerRef.current = new SpeechSynthesizer(speechConfigRef.current);
      }
    }
  };

  const toggleListening = async () => {
    if (!recognizerRef.current) return;

    if (isListening) {
      recognizerRef.current.stopContinuousRecognitionAsync();
      setIsListening(false);
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      setIsListening(true);

      recognizerRef.current.startContinuousRecognitionAsync();

      recognizerRef.current.recognized = async (_, e) => {
        const resultText = e.result.text.trim();
        if (e.result.reason === ResultReason.RecognizedSpeech && resultText) {
          stopSpeaking();
          recognizerRef.current?.stopContinuousRecognitionAsync();
          setIsListening(false);
          await handleAgentResponse(resultText);
        }
      };

      recognizerRef.current.canceled = (_, e) => {
        setError(`Speech recognition error: ${e.errorDetails}`);
        setIsListening(false);
      };
    } catch {
      setError("Mic access denied. Please allow microphone permissions.");
    }
  };

  const speak = (text: string, onDone?: () => void) => {
    if (!synthesizerRef.current) return;

    isSpeakingRef.current = true;

    const ssml = `
      <speak version='1.0' xml:lang='en-US'>
        <voice xml:lang='en-US' xml:gender='Female' name='en-US-JennyNeural'>
          ${text}
        </voice>
      </speak>`;

    synthesizerRef.current.speakSsmlAsync(
      ssml,
      () => {
        isSpeakingRef.current = false;
        onDone?.();
      },
      (err) => {
        console.error("Speech synthesis failed:", err);
        isSpeakingRef.current = false;
        setError("Something went wrong while speaking.");
      }
    );
  };

  const handleAgentResponse = async (text: string) => {
    try {
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setIsLoading(true);

      const { data } = await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}ai/voice-book`,
        { message: text }
      );

      const agentReply = data.reply || "Sorry, I didn’t get that.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: agentReply },
      ]);

      speak(agentReply, () => {
        setIsLoading(false);
        toggleListening(); // Auto-resume listening
      });
    } catch (err) {
      console.error("Agent fetch error:", err);
      setError("Couldn't talk to the server. Try again?");
      speak("Oops, I had trouble reaching the server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-[90vh] bg-[#0f0f0f] text-white flex flex-col items-center justify-between p-4">
      {/* Header */}
      <div className="w-full max-w-3xl text-center py-3 sticky top-0 z-10 bg-[#0f0f0f]">
        <h2 className="text-3xl font-extrabold">Swasthy</h2>
        <p className="text-sm text-gray-400 mt-1">Powered by Swastify ✨</p>
      </div>

      {/* Chat Window */}
      <div className="flex-1 w-full max-w-3xl overflow-y-auto bg-[#1a1a1a] rounded-2xl p-4 shadow-inner">
        <div className="flex flex-col space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-xl px-4 py-3 text-sm max-w-[80%] ${
                msg.role === "user"
                  ? "bg-blue-600 self-end text-right"
                  : "bg-gray-700 self-start"
              }`}
            >
              <div className="text-xs font-semibold opacity-70 mb-1">
                {msg.role === "user" ? "You" : "Swasthy"}
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}

          {isLoading && (
            <div className="bg-gray-700 text-white text-sm px-4 py-3 rounded-xl max-w-[80%] self-start animate-pulse">
              <div className="text-xs font-semibold opacity-70 mb-1">Swasthy</div>
              Thinking...
            </div>
          )}

          <div ref={endOfMessagesRef} />
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="w-full max-w-3xl pt-4">
        {error && (
          <div className="text-red-400 text-center mb-2 text-sm font-medium">
            {error}
          </div>
        )}
        <button
          onClick={toggleListening}
          className={`w-full py-3 rounded-full text-lg font-semibold transition ${
            isListening ? "bg-red-600" : "bg-green-600"
          } hover:opacity-90`}
        >
          {isListening ? "🛑 Stop Listening" : "🎙️ Start Talking"}
        </button>
      </div>
    </div>
  );
}

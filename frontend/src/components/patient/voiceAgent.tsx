"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
  ResultReason,
  CancellationReason,
} from "microsoft-cognitiveservices-speech-sdk";
import api from "@/lib/axios";

export default function VoiceAgent() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const synthesizerRef = useRef<SpeechSynthesizer | null>(null);
  const isSpeakingRef = useRef(false);
  const speechConfigRef = useRef<SpeechConfig | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
    const serviceRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

    if (!speechKey || !serviceRegion) {
      console.error("Azure Speech config missing");
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

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const stopSpeaking = () => {
    if (synthesizerRef.current && isSpeakingRef.current) {
      synthesizerRef.current.close();
      synthesizerRef.current = null;
      if (speechConfigRef.current) {
        synthesizerRef.current = new SpeechSynthesizer(speechConfigRef.current);
      }
      isSpeakingRef.current = false;
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      recognizerRef.current?.stopContinuousRecognitionAsync();
      setIsListening(false);
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      recognizerRef.current?.startContinuousRecognitionAsync();
      setIsListening(true);

      recognizerRef.current!.recognized = async (s, e) => {
        if (
          e.result.reason === ResultReason.RecognizedSpeech &&
          e.result.text.trim()
        ) {
          stopSpeaking();
          recognizerRef.current?.stopContinuousRecognitionAsync();
          setIsListening(false);
          handleAgentResponse(e.result.text);
        }
      };

      recognizerRef.current!.canceled = (s, e) => {
        if (e.reason === CancellationReason.Error) {
          console.error("Recognition canceled: ", e.errorDetails);
          setError("Speech recognition error: " + e.errorDetails);
          setIsListening(false);
        }
      };
    } catch {
      setError("Please allow microphone access in your browser.");
    }
  };

  const speak = (text: string, onDone?: () => void) => {
    if (synthesizerRef.current) {
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
          setTimeout(() => {
            onDone?.();
          }, 400);
        },
        (err) => {
          console.error("Speak error:", err);
          isSpeakingRef.current = false;
        }
      );
    }
  };

  const handleAgentResponse = async (text: string) => {
    try {
      setMessages((prev) => [...prev, { role: "user", content: text }]);

      const response = await api.post("http://localhost:3001/ai/voice-book", {
        message: text,
      });

      const data = await response.data;
      const agentReply = data.reply || "Sorry, I didn’t get that.";

      setMessages((prev) => [...prev, { role: "assistant", content: agentReply }]);

      speak(agentReply, () => {
        toggleListening();
      });
    } catch (err) {
      console.error(err);
      setError("Failed to contact agent.");
      speak("Sorry, I couldn’t talk to the server. Try again?");
    }
  };

  return (
    <div className="w-full h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-between p-4">
      {/* Header */}
      <div className="w-full max-w-3xl text-center py-3 sticky top-0 z-10 bg-[#0f0f0f]">
        <h2 className="text-3xl font-extrabold">🧠 Voice Assistant</h2>
        <p className="text-sm text-gray-400 mt-1">Powered by Azure & Gundu Bhai</p>
      </div>

      {/* Message container */}
      <div className="flex-1 w-full max-w-3xl overflow-y-auto bg-[#1a1a1a] rounded-2xl p-4 shadow-inner">
        <div className="flex flex-col space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`rounded-xl px-4 py-3 text-sm max-w-[80%] ${
                msg.role === "user"
                  ? "bg-blue-600 text-white self-end text-right"
                  : "bg-gray-700 text-white self-start"
              }`}
            >
              <div className="text-xs font-semibold opacity-70 mb-1">
                {msg.role === "user" ? "You" : "Swasthy"}
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>
      </div>

      {/* Bottom Controls */}
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

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

// This component is a voice agent that uses Azure's Speech SDK to recognize speech and synthesize speech.



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
    <div className="w-full h-[90vh] bg-gradient-to-br from-black to-gray-900 text-gray-100 p-6 font-sans flex flex-col">
      <h2 className="text-4xl font-bold mb-6 text-blue-400 text-center">🧠 Gundu Voice Agent</h2>

      <div className="flex justify-center gap-6 mb-6">
        <button
          onClick={toggleListening}
          className={`px-6 py-3 rounded-lg text-lg font-semibold shadow-lg transition-all duration-300 ${
            isListening
              ? "bg-red-600 hover:bg-red-500 text-white"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          {isListening ? "🛑 Stop Listening" : "🎙️ Talk to Gundu"}
        </button>

        <button
          onClick={() => speak("Hello from your voice agent!")}
          className="px-6 py-3 rounded-lg text-lg font-semibold bg-green-600 hover:bg-green-500 text-white shadow-lg transition-all duration-300"
        >
          🔊 Test Voice
        </button>
      </div>

      {error && <p className="text-red-400 font-semibold mb-4 text-center">{error}</p>}

      <div className="flex-1 overflow-y-auto bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-inner">
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl max-w-[75%] text-base whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-blue-700 text-blue-100 self-end ml-auto shadow-md"
                  : "bg-gray-700 text-gray-100 shadow-md"
              }`}
            >
              <span className="font-semibold block mb-1">
                {msg.role === "user" ? "🧍 You" : "🤖 Gundu"}:
              </span>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

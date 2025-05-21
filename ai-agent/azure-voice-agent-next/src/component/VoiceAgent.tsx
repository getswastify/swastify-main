"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
  ResultReason,
} from "microsoft-cognitiveservices-speech-sdk";

export default function VoiceAgent() {
  const [recognizing, setRecognizing] = useState(false);
  const [userText, setUserText] = useState("");
  const [agentText, setAgentText] = useState("");
  const [error, setError] = useState("");

  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const synthesizerRef = useRef<SpeechSynthesizer | null>(null);

  useEffect(() => {
    const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
    const serviceRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

    console.log("Azure Speech Key:", speechKey ? "✅" : "❌");
    console.log("Azure Region:", serviceRegion ? "✅" : "❌");

    if (!speechKey || !serviceRegion) {
      console.error(
        "Azure Speech key or service region is not defined in environment variables."
      );
      setError("Azure Speech key or region missing in environment variables.");
      return;
    }

    const speechConfig = SpeechConfig.fromSubscription(speechKey, serviceRegion);
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();

    recognizerRef.current = new SpeechRecognizer(speechConfig, audioConfig);
    synthesizerRef.current = new SpeechSynthesizer(speechConfig);

    return () => {
      recognizerRef.current?.close();
      synthesizerRef.current?.close();
    };
  }, []);

  const startRecognition = () => {
    setError("");
    setRecognizing(true);
    if (recognizerRef.current) {
      recognizerRef.current.recognizeOnceAsync(
        (result) => {
          if (result.reason === ResultReason.RecognizedSpeech) {
            setUserText(result.text);
            setRecognizing(false);
            handleAgentResponse(result.text);
          } else {
            setUserText("I didn't get that, try again!");
            setRecognizing(false);
          }
        },
        (err) => {
          console.error(err);
          setError("Speech recognition error: " + err);
          setRecognizing(false);
        }
      );
    } else {
      setError("Speech recognizer is not initialized.");
      setRecognizing(false);
    }
  };

  // Mic permission check before recognition
  const checkMicAccess = async () => {
    setError("");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      startRecognition();
    } catch {
      setError("Please allow microphone access in your browser.");
    }
  };

  const handleAgentResponse = (text: string) => {
    const reply = "You said: " + text; // Replace with your AI backend call here
    setAgentText(reply);
    if (synthesizerRef.current) {
      synthesizerRef.current.speakTextAsync(reply);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2>Azure Voice Agent Chat</h2>
      <button onClick={checkMicAccess} disabled={recognizing}>
        {recognizing ? "Listening..." : "Talk to Agent"}
      </button>

      <button
        style={{ marginLeft: 10 }}
        onClick={() => {
          if (synthesizerRef.current) {
            synthesizerRef.current.speakTextAsync("Hello from your voice agent!");
          }
        }}
      >
        Test Voice Output
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 10, fontWeight: "bold" }}>{error}</p>
      )}

      <div style={{ marginTop: 20 }}>
        <strong>You:</strong>
        <p>{userText}</p>
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Agent:</strong>
        <p>{agentText}</p>
      </div>
    </div>
  );
}

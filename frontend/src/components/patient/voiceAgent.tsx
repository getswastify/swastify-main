"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  AudioConfig,
  ResultReason,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { Mic, SendHorizontal, Square,MoreVertical  } from "lucide-react";
import api from "@/lib/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function VoiceAgent() {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const speechConfigRef = useRef<SpeechConfig | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isSpeakingRef = useRef(false);
  const userInterruptedRef = useRef(false);
  const endRef = useRef<HTMLDivElement | null>(null);


const resetConversation = useCallback(async () => {
    try {

      await api.delete("/ai/reset-conversation");
      setMessages([]);
      setTextInput("");
    } catch (error) {

      console.error(error);
    }
  }, []);






  const stopSpeaking = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      isSpeakingRef.current = false;
      userInterruptedRef.current = true;
    }
  }, []);

  const playAudio = useCallback(async (audioBuffer: AudioBuffer) => {
    stopSpeaking();
    const source = audioContextRef.current!.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current!.destination);
    source.onended = () => (isSpeakingRef.current = false);
    audioSourceRef.current = source;
    isSpeakingRef.current = true;
    userInterruptedRef.current = false;
    source.start();
  }, [stopSpeaking]);

  const stopListening = useCallback(() => {
    return new Promise<void>((resolve) => {
      recognizerRef.current?.stopContinuousRecognitionAsync(() => {
        setIsListening(false);
        resolve();
      });
    });
  }, []);

  const startListening = useCallback(async () => {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    recognizerRef.current?.startContinuousRecognitionAsync();
    setIsListening(true);
  }, []);

  const handleMessage = useCallback(
    async (text: string, isVoiceInput = false) => {
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setIsLoading(true);
      setError("");

      try {
        const { data } = await api.post("/ai/voice-book", { message: text });
        const reply = data.reply ?? "Sorry, I didn’t get that.";

        if (isVoiceInput) {
          const res = await api.post(
            "/ai/tts",
            { message: reply },
            { responseType: "arraybuffer" }
          );
          const buffer = await audioContextRef.current!.decodeAudioData(
            res.data
          );
          await playAudio(buffer);
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply },
        ]);

        if (isVoiceInput && !userInterruptedRef.current) {
          await startListening();
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    },
    [playAudio, startListening]
  );

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!;
    const region = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!;
    if (!key || !region) {
      setError("Missing Azure credentials");
      return;
    }

    const config = SpeechConfig.fromSubscription(key, region);
    const audioInput = AudioConfig.fromDefaultMicrophoneInput();
    recognizerRef.current = new SpeechRecognizer(config, audioInput);
    speechConfigRef.current = config;
    audioContextRef.current = new AudioContext();

    recognizerRef.current.recognized = async (_, e) => {
      if (
        e.result.reason === ResultReason.RecognizedSpeech &&
        e.result.text.trim()
      ) {
        await stopListening();
        await handleMessage(e.result.text.trim(), true);
      }
    };

    recognizerRef.current.canceled = (_, e) => {
      console.error("Speech error:", e.errorDetails);
      setError("Speech recognition failed");
      setIsListening(false);
    };

    return () => {
      recognizerRef.current?.close();
      audioContextRef.current?.close();
    };
  }, [handleMessage, stopListening]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    stopSpeaking();
    await stopListening();

    const input = textInput.trim();
    setTextInput("");

    await handleMessage(input);
  };

  // ✅ FIXED ESLINT RULE - changed ternary into if/else
  const toggleMic = async () => {
    if (isSpeakingRef.current) stopSpeaking();

    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  return (
    <div className="w-full h-[93vh] bg-[#0C1120] text-white flex flex-col">
     
{/* Top Right Dropdown for Reset */}
<div className="absolute lg:top-4 top-[4rem] right-4 z-20">
  <DropdownMenu>
    <DropdownMenuTrigger
      className="
        p-2 rounded-full hover:bg-gray-700 transition
        sm:p-3
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
      aria-label="More options"
    >
      <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="bg-[#1f1f1f] border border-gray-700 w-44 sm:w-52"
      id="menu-dropdown"
    >
      <DropdownMenuItem
        onClick={() => {
          resetConversation();

        }}
        className="cursor-pointer text-red-500 hover:bg-red-600/30"
      >
        Reset Conversation
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl w-full mx-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-sm px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-[#1f1f1f] text-gray-100 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}


        {isLoading && (
          <div className="mb-4 flex justify-start">
            <div className="bg-[#1f1f1f] text-gray-300 px-4 py-3 text-sm rounded-2xl rounded-bl-none animate-pulse">
              Swasthy is thinking...
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 bg-[#0C1120] p-4 w-full max-w-2xl mx-auto">
        <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
          <input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 px-4 py-3 bg-[#1a1a1a] text-white rounded-full outline-none text-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-full hover:opacity-90 flex items-center justify-center"
          >
            <SendHorizontal className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleMic}
            className={`ml-2 p-2 rounded-full transition hover:opacity-90 ${
              isListening ? "bg-red-600" : "bg-green-600"
            }`}
            title={isListening ? "Stop Listening" : "Start Talking"}
          >
            {isListening ? (
              <Square className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>
        </form>
        {error && <div className="text-red-400 mt-2 text-sm">{error}</div>}
      </div>
    </div>
  );
}

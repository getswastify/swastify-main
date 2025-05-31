"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { AudioConfig, ResultReason, SpeechConfig, SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk"
import { Mic, SendHorizontal, Square, MoreVertical, Bot, Zap } from "lucide-react"
import api from "@/lib/axios"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function VoiceAgent() {
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [error, setError] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])

  const recognizerRef = useRef<SpeechRecognizer | null>(null)
  const speechConfigRef = useRef<SpeechConfig | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const isSpeakingRef = useRef(false)
  const userInterruptedRef = useRef(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  const resetConversation = useCallback(async () => {
    try {
      await api.delete("/ai/reset-conversation")
      setMessages([])
      setTextInput("")
    } catch (error) {
      console.error(error)
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop()
      isSpeakingRef.current = false
      userInterruptedRef.current = true
    }
  }, [])

  const playAudio = useCallback(
    async (audioBuffer: AudioBuffer) => {
      stopSpeaking()
      const source = audioContextRef.current!.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current!.destination)
      source.onended = () => (isSpeakingRef.current = false)
      audioSourceRef.current = source
      isSpeakingRef.current = true
      userInterruptedRef.current = false
      source.start()
    },
    [stopSpeaking],
  )

  const stopListening = useCallback(() => {
    return new Promise<void>((resolve) => {
      recognizerRef.current?.stopContinuousRecognitionAsync(() => {
        setIsListening(false)
        resolve()
      })
    })
  }, [])

  const startListening = useCallback(async () => {
    await navigator.mediaDevices.getUserMedia({ audio: true })
    recognizerRef.current?.startContinuousRecognitionAsync()
    setIsListening(true)
  }, [])

  const handleMessage = useCallback(
    async (text: string, isVoiceInput = false) => {
      setMessages((prev) => [...prev, { role: "user", content: text }])
      setIsLoading(true)
      setError("")

      try {
        const { data } = await api.post("/ai/voice-book", { message: text })
        const reply = data.reply ?? "Sorry, I didn't get that."

        if (isVoiceInput) {
          const res = await api.post("/ai/tts", { message: reply }, { responseType: "arraybuffer" })
          const buffer = await audioContextRef.current!.decodeAudioData(res.data)
          await playAudio(buffer)
        }

        setMessages((prev) => [...prev, { role: "assistant", content: reply }])

        if (isVoiceInput && !userInterruptedRef.current) {
          await startListening()
        }
      } catch (err) {
        console.error(err)
        setError("Something went wrong.")
      } finally {
        setIsLoading(false)
      }
    },
    [playAudio, startListening],
  )

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!
    const region = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!
    if (!key || !region) {
      setError("Missing Azure credentials")
      return
    }

    const config = SpeechConfig.fromSubscription(key, region)
    const audioInput = AudioConfig.fromDefaultMicrophoneInput()
    recognizerRef.current = new SpeechRecognizer(config, audioInput)
    speechConfigRef.current = config
    audioContextRef.current = new AudioContext()

    recognizerRef.current.recognized = async (_, e) => {
      if (e.result.reason === ResultReason.RecognizedSpeech && e.result.text.trim()) {
        await stopListening()
        await handleMessage(e.result.text.trim(), true)
      }
    }

    recognizerRef.current.canceled = (_, e) => {
      console.error("Speech error:", e.errorDetails)
      setError("Speech recognition failed")
      setIsListening(false)
    }

    return () => {
      recognizerRef.current?.close()
      audioContextRef.current?.close()
    }
  }, [handleMessage, stopListening])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textInput.trim()) return

    stopSpeaking()
    await stopListening()

    const input = textInput.trim()
    setTextInput("")

    await handleMessage(input)
  }

  const toggleMic = async () => {
    if (isSpeakingRef.current) stopSpeaking()

    if (isListening) {
      await stopListening()
    } else {
      await startListening()
    }
  }

  return (
    <div className="w-full h-full  text-white flex flex-col relative overflow-hidden">
      <div className="fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 rounded-full hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-gray-900/40 backdrop-blur-sm shadow-lg">
            <MoreVertical className="w-5 h-5 text-gray-200 hover:text-white transition-colors" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50">
            <DropdownMenuItem
              onClick={resetConversation}
              className="cursor-pointer text-red-400 hover:bg-red-600/20 focus:bg-red-600/20"
            >
              Reset Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl w-full mx-auto relative z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center ai-glow">
                <Bot className="w-12 h-12 text-white floating-element" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Welcome to Swasthy AI</h2>
              <p className="text-gray-400 max-w-md">
                I'm your AI-powered healthcare assistant. Ask me anything about your health, book appointments, or get
                medical guidance.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <div className="px-3 py-1 bg-emerald-500/20 rounded-full text-sm text-emerald-400 border border-emerald-500/30">
                Book Appointments
              </div>
              <div className="px-3 py-1 bg-blue-500/20 rounded-full text-sm text-blue-400 border border-blue-500/30">
                Health Guidance
              </div>
              <div className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-400 border border-purple-500/30">
                Symptom Analysis
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`mb-6 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex items-start space-x-3 max-w-2xl ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500"
                    : "bg-gradient-to-r from-emerald-400 to-blue-500"
                }`}
              >
                {msg.role === "user" ? (
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`ai-message-bubble px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white border-blue-500/30"
                    : "bg-gradient-to-r from-gray-800/80 to-gray-700/80 text-gray-100 border-emerald-500/30"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="mb-6 flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="ai-message-bubble bg-gradient-to-r from-gray-800/80 to-gray-700/80 text-gray-300 px-4 py-3 text-sm border-emerald-500/30">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span>Swasthy is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="ai-input-area border-t border-emerald-500/20 p-4 w-full max-w-4xl mx-auto relative z-20">
        <form onSubmit={handleTextSubmit} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your message or use voice..."
              className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-xl text-white rounded-2xl outline-none text-sm border border-gray-700/50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse delay-100"></div>
                  <div className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="p-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-2xl hover:from-emerald-600 hover:to-blue-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <SendHorizontal className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={toggleMic}
            className={`p-3 rounded-2xl transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
              isListening
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
            }`}
            title={isListening ? "Stop Listening" : "Start Talking"}
          >
            {isListening ? <Square className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
          </button>
        </form>

        {error && (
          <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

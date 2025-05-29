"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { AudioConfig, ResultReason, SpeechConfig, SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk"
import { Mic, Send, Square, Bot } from "lucide-react"
import api from "@/lib/axios"

export default function VoiceAgent() {
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])

  const recognizerRef = useRef<SpeechRecognizer | null>(null)
  const speechConfigRef = useRef<SpeechConfig | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const isSpeakingRef = useRef(false)
  const userInterruptedRef = useRef(false)
  const endRef = useRef<HTMLDivElement | null>(null)

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
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }])
      } finally {
        setIsLoading(false)
      }
    },
    [playAudio, startListening],
  )

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!
    const region = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!
    if (!key || !region) return

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
    <div className="h-full w-full flex flex-col bg-transparent">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] sm:min-h-[60vh] text-center space-y-6 sm:space-y-8">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full animate-ping opacity-20"></div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800 dark:text-gray-200">
                  Hello! I&apos;m Swasthy AI
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
                  How can I help you with your medical appointments today?
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`mb-6 sm:mb-8 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] sm:max-w-2xl ${msg.role === "user" ? "text-right" : "text-left"}`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center mb-2 space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Swasthy AI</span>
                  </div>
                )}
                <div
                  className={`inline-block px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl text-sm sm:text-base leading-relaxed transition-all duration-200 ${
                    msg.role === "user"
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-6 sm:mb-8 flex justify-start">
              <div className="max-w-[85%] sm:max-w-2xl">
                <div className="flex items-center mb-2 space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Swasthy AI</span>
                </div>
                <div className="inline-block px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-transparent backdrop-blur-sm">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <form onSubmit={handleTextSubmit} className="flex items-end gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Message Swasthy AI"
                rows={1}
                className="w-full px-4 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl resize-none outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 text-sm sm:text-base"
                style={{ minHeight: "48px", maxHeight: "120px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleTextSubmit(e)
                  }
                }}
              />
              {isListening && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse delay-100"></div>
                    <div className="w-1 h-2 bg-red-500 rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!textInput.trim()}
              className="p-3 sm:p-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              type="button"
              onClick={toggleMic}
              className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {isListening ? <Square className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

"use client"

import React, { useState } from "react"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

export default function AIChat() {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi! I'm your AI assistant. I can help you with information about your projects and tasks. What would you like to know?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: input,
          userId: user.id,
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || data.error || "Sorry, I could not process your request.",
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-screen bg-white text-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[700px] bg-white border border-black rounded-lg flex flex-col">
        {/* Header */}
        <div className="border-b border-black p-4">
          <h1 className="flex items-center gap-3 text-xl font-bold">
            <div className="w-8 h-8 border border-black rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            AI Assistant
          </h1>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "assistant" && (
                  <div className="w-10 h-10 border border-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
                
                <div className={`max-w-[70%] ${message.sender === "user" ? "order-1" : ""}`}>
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-black text-white"
                        : "border border-black"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2 px-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {message.sender === "user" && (
                  <div className="w-10 h-10 border border-white rounded-full flex items-center justify-center flex-shrink-0 mt-1 order-2">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 border border-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="border border-white rounded-lg px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-white p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your projects and tasks..."
              disabled={isLoading}
              className="flex-1 bg-white border border-black rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[60px]"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [inputMessage, setInputMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || processing) return;

    setProcessing(true);

    // Add user message to conversation
    const userMessage: Message = { role: "user", content: inputMessage };
    setConversation((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: conversation,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from agent");
      }

      const data = await response.json();

      // Add assistant response to conversation
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setConversation((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I encountered an error while processing your request. Please try again.",
      };
      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setProcessing(false);
      setInputMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#c10f2f] to-[#15218e] dark:from-[#8b0a24] dark:to-[#00095e] text-white px-4 py-6">
      <div className="text-center max-w-3xl w-full mx-auto space-y-4">
        <h1 className="text-5xl font-bold drop-shadow-md">InvestAI</h1>
        <p className="text-xl text-white/80">
          Begin chatting to get instant AI-powered insights on everything stock
          related!
        </p>
      </div>

      {/* Conversation Display */}
      <div className="flex-1 max-w-3xl w-full mx-auto mt-6 mb-4">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-600/20 ml-auto max-w-xs"
                  : "bg-white/10 max-w-2xl"
              }`}
            >
              <div className="font-semibold mb-2">
                {message.role === "user" ? "You" : "InvestAI"}
              </div>
              <div className="prose prose-invert">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {processing && (
            <div className="p-4 rounded-lg bg-white/10 max-w-2xl">
              <div className="font-semibold mb-2">InvestAI</div>
              <div className="text-white/70">Thinking...</div>
            </div>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div className="max-w-3xl w-full mx-auto">
        <div className="grid w-full gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here! (e.g., 'What are the closing prices of AAPL starting from 2024-01-01?')"
            rows={6}
            className="text-white"
          />
          <Button
            variant="secondary"
            onClick={handleSendMessage}
            disabled={processing || !inputMessage.trim()}
          >
            {processing ? "Analyzing Question..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}

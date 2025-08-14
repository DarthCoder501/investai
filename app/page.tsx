"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [messages, setMessages] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#c10f2f] to-[#15218e] dark:from-[#8b0a24] dark:to-[#00095e] text-white px-4 py-10">
      <div className="text-center max-w-3xl w-full space-y-8">
        <h1 className="text-5xl font-bold drop-shadow-md">InvestAI</h1>
        <p className="text-xl text-white/80">
          Begin chatting to get instant AI-powered insights on everything stock
          related!
        </p>
        <div className="grid w-full gap-2">
          <Textarea
            value={messages}
            onChange={(e) => setMessages(e.target.value)}
            placeholder="Type your question here!"
            rows={6}
            className="text-white"
          />
          <Button variant="secondary">
            {processing ? "Analyzing Question..." : "Send"}
          </Button>
        </div>

        <div className="mt-6 bg-white/10 p-6 rounded-lg w-full text-left prose prose-invert max-w-4xl">
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText, stepCountIs, tool, ModelMessage } from "ai";
import yahooFinance from "yahoo-finance2";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import dotenv from "dotenv";

// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

// Create openrouter client
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Define tools for LLM
const tools = {
  historicalprices: tool({
    description:
      "Get past prices of a stock from today until a user specificed date",
    inputSchema: z.object({
      query: z.string().describe("Stock symbol"),
      histqueryOptions: z.string().describe("Starting date"),
    }),
    execute: async (input: { query: string; histqueryOptions: string }) => {
      return await yahooFinance.historical(input.query, {
        period1: input.histqueryOptions,
      });
    },
  }),
  stock_search: tool({
    description: "Retrives relevant news about a stock",
    inputSchema: z.object({
      searchquery: z.string().describe("Stock symbol"),
    }),
    execute: async (input: { searchquery: string }) => {
      return await yahooFinance.search(input.searchquery);
    },
  }),
  stock_insights: tool({
    description: "Get the insights of a stock",
    inputSchema: z.object({
      stock: z.string().describe("Stock symbol"),
    }),
    execute: async (input: { stock: string }) => {
      return await yahooFinance.insights(input.stock);
    },
  }),
  answer: tool({
    description: "A tool for providing the final answer.",
    inputSchema: z.object({
      steps: z.array(
        z.object({
          calculation: z.string(),
          reasoning: z.string(),
        })
      ),
      answer: z.string(),
    }),
    // no execute function - invoking it will terminate the agent
  }),
};

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OpenRouter API key not configured. Please set OPENROUTER_API_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }
    const { message: userMessage, conversationHistory = [] } =
      await request.json();

    // Define message roles
    const messages: ModelMessage[] = [
      {
        role: "system",
        content:
          `You are a helpful financial assistant.` +
          `When asked about a stock (either by ticker or company name),` +
          `you may call tools to look up its historical prices, recent news, or stock insights.` +
          `Always respond to the user in a clear, simple, and conversational way.`,
      },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    const { response } = await generateText({
      model: openrouter("mistralai/mistral-nemo:free"),
      tools,
      messages,
      toolChoice: "required",
      stopWhen: stepCountIs(5),
    });

    // Update chat history with new AI & User messages
    messages.push(...response.messages);

    return NextResponse.json({
      response: response,
      conversationHistory: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    });
  } catch (error) {
    console.error("Error processing chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

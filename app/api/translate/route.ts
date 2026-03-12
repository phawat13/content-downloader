import { NextRequest, NextResponse } from "next/server";

interface TranslateRequest {
  text: string;
  apiKey: string;
  model: string;
  sourceLanguage: string;
  targetLanguage: string;
  prompt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    const { text, apiKey, model, sourceLanguage, targetLanguage, prompt } = body;

    if (!text || !apiKey) {
      return NextResponse.json(
        { error: "Missing text or apiKey" },
        { status: 400 }
      );
    }

    const systemPrompt =
      prompt ||
      `You are a professional translator. Translate the following text from ${sourceLanguage || "auto-detect"} to ${targetLanguage || "Thai"}. Translate in full detail, do NOT summarize or shorten the content. Preserve the original structure, paragraphs, and line breaks. Only output the translated text, nothing else.`;

    const geminiModel = model || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\n---\n\n${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 65536,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return NextResponse.json(
        { error: `Gemini API error: ${response.status} - ${errBody}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const translated =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ translated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

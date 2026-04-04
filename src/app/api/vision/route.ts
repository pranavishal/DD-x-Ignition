import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { image } = await req.json();

  if (!image) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.replace(/'/g, "")}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are an expert architectural historian. When shown a photo of a building, identify it and respond ONLY with valid JSON (no markdown, no code fences) in this exact format: {\"name\":\"Building Name\",\"year\":\"Year built or circa\",\"style\":\"Architectural style\",\"architect\":\"Architect name or Unknown\",\"history\":\"2-3 sentence fascinating history of this building.\",\"funFact\":\"One surprising or little-known fact.\"}. If you cannot identify the specific building, still describe its architectural style and provide context about that style of architecture in the area.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify this building and tell me its architectural history.",
            },
            {
              type: "image_url",
              image_url: { url: image, detail: "low" },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: "OpenAI API error", detail: err }, { status: 502 });
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      name: "Unknown Building",
      year: "Unknown",
      style: "Unknown",
      architect: "Unknown",
      history: content,
      funFact: "",
    });
  }
}

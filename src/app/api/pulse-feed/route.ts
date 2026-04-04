import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getStaticFeedItems } from "@/data/mockFeedItems";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { cityName } = await request.json();

    if (!cityName) {
      return NextResponse.json(
        { error: "cityName is required" },
        { status: 400 }
      );
    }

    const prompt = `
      Generate 8 realistic local feed items for ${cityName} right now. Return ONLY a JSON array, no markdown.

      Each item must have: { "type": "event"|"news"|"social"|"live-update", "title": string, "description": string, "source": string, "timestamp": string }

      Mix:
      - 2 events (Luma-style with venue name + time, source should be "Luma" or event platform)
      - 2 local news (source should be a realistic local newspaper name)
      - 2 social posts (source should be @username format, casual tone)
      - 2 live updates (source should be "Live", happening right now)

      Timestamps should be relative like "2h ago", "15m ago", "Just now".
      Make them feel authentic to ${cityName}'s culture and scene.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const content = completion.choices[0].message.content || "[]";
    const cleanContent = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const rawItems = JSON.parse(cleanContent);

    const items = rawItems.map((item: Record<string, string>, i: number) => ({
      id: `ai-feed-${Date.now()}-${i}`,
      type: item.type || "news",
      title: item.title || "Local Update",
      description: item.description || "",
      source: item.source || "Local",
      timestamp: item.timestamp || "Just now",
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Pulse feed generation failed:", error);

    const { cityName } = await request
      .clone()
      .json()
      .catch(() => ({ cityName: "the city" }));

    return NextResponse.json({
      items: getStaticFeedItems(cityName).map((item) => ({
        ...item,
        id: `fallback-${item.id}`,
      })),
    });
  }
}

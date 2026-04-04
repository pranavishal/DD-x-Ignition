import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { name, lat, lng, type, height, searchLocation } = await request.json();

    const prompt = `You are a knowledgeable architectural historian and urban researcher.

Given a building at these coordinates:
- Latitude: ${lat}, Longitude: ${lng}
- OSM Name: "${name}"
- Building Type: ${type || "Unknown"}
- Estimated Height: ${height ? Math.round(height) + "m" : "Unknown"}
- City/Region: "${searchLocation}"

Identify this building and provide detailed, accurate information. If you recognize the specific building, provide its real history. If not, provide the most likely history based on the neighborhood, building characteristics, and your knowledge of the area.

Return a JSON object with exactly these fields:
{
  "name": "The actual/best-known name of this building",
  "address": "Full street address",
  "yearBuilt": "Year or decade (e.g. '1931' or 'c. 1920s')",
  "architecturalStyle": "Primary architectural style (e.g. Art Deco, Brutalist, Gothic Revival, International Style)",
  "summary": "A compelling 2-3 sentence description highlighting what makes this building or location historically significant or interesting. Make the reader want to learn more.",
  "originalUse": "Original purpose when built",
  "currentUse": "Current primary use",
  "timelineEvents": [
    { "year": "YYYY", "title": "Brief event title", "description": "1-2 sentence description" }
  ]
}

Provide 3-5 timeline events ordered chronologically. Be specific and factual where possible. If uncertain, provide educated estimates based on the area's known history. Do not include caveats or uncertainty language in the output.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const content = completion.choices[0].message.content || "{}";
    const raw = JSON.parse(content);

    const enriched = {
      name: raw.name || name,
      address: raw.address || "Unknown address",
      yearBuilt: raw.yearBuilt || "Unknown",
      architecturalStyle: raw.architecturalStyle || "",
      summary: raw.summary || "",
      originalUse: raw.originalUse || type || "Unknown",
      currentUse: raw.currentUse || "Unknown",
      timelineEvents: Array.isArray(raw.timelineEvents) ? raw.timelineEvents : [],
    };

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error enriching building:", error);
    return NextResponse.json(
      { error: "Failed to enrich building data" },
      { status: 500 }
    );
  }
}

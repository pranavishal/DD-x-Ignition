import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateHistoricalImage(
  prompt: string,
  fallbackUrl: string
): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      style: "natural",
    });
    return response.data?.[0]?.url || fallbackUrl;
  } catch (e) {
    console.error("DALL-E generation failed:", e);
    return fallbackUrl;
  }
}

async function generateSceneAudio(text: string): Promise<string> {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: text,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return `data:audio/mp3;base64,${buffer.toString("base64")}`;
  } catch (e) {
    console.error("TTS generation failed:", e);
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const { name, lat, lng, type, context } = await request.json();

    // 1. Generate the 3-part script
    const scriptPrompt = `
      You are a historical documentary narrator.
      I am looking at a building located at coordinates ${lat}, ${lng}.
      ${name !== "Unknown Building" ? `It is known as or near "${name}".` : ""}
      ${type ? `It is a ${type} building.` : ""}
      ${context ? `Here is verified information about this building: ${context}` : ""}

      Write a 3-part short documentary script about the history of this specific building, or if it's a generic building, the history of this specific neighborhood/block in the city.
      Use the verified information provided to ground your narrative in real facts.
      Each part should be 2-3 sentences — concise enough for a ~15 second voiceover per part.

      Return EXACTLY a JSON array of 3 strings. No markdown formatting, no code blocks, just the raw JSON array.
      Example: ["In the early 1900s, this area was...", "During the post-war boom...", "Today, it stands as..."]
    `;

    console.log("Generating script for:", name, lat, lng);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: scriptPrompt }],
      temperature: 0.7,
    });

    let scriptArray: string[];
    try {
      const content = completion.choices[0].message.content || "[]";
      const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
      scriptArray = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse script JSON, using fallback");
      scriptArray = [
        "This location holds a rich, untold history.",
        "Over the decades, the surrounding neighborhood transformed dramatically.",
        "Today, it remains a vital part of the city's fabric.",
      ];
    }

    // 2. Generate ALL assets in parallel: 2 images + 3 audio clips
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const modernImageUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&fov=90&heading=235&pitch=10&key=${googleApiKey}`;

    console.log("Generating images and voiceovers in parallel...");

    const [image1Url, image2Url, audio1, audio2, audio3] = await Promise.all([
      generateHistoricalImage(
        `A highly realistic, authentic 1920s black and white archival photograph of a city street corner resembling the architecture at latitude ${lat}, longitude ${lng}. Vintage cars, pedestrians in period clothing. Sepia tone, slight film grain.`,
        "https://images.unsplash.com/photo-1546436836-07a91091f11c?auto=format&fit=crop&w=800&q=80"
      ),
      generateHistoricalImage(
        `A highly detailed, vintage architectural blueprint sketch of a building resembling the structure at latitude ${lat}, longitude ${lng}. Drawn on aged, slightly yellowed paper with precise linework.`,
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
      ),
      generateSceneAudio(scriptArray[0] || "Exploring the history of this location."),
      generateSceneAudio(scriptArray[1] || "Decades ago, this area looked vastly different."),
      generateSceneAudio(scriptArray[2] || "Today, the legacy of the past still echoes."),
    ]);

    // 3. Assemble scenes — each scene owns its own audio
    const storyScenes = [
      {
        text: scriptArray[0] || "Exploring the history of this location...",
        imageUrl: modernImageUrl,
        duration: 8000,
        audioUrl: audio1 || undefined,
      },
      {
        text: scriptArray[1] || "Decades ago, this area looked vastly different.",
        imageUrl: image1Url,
        duration: 8000,
        audioUrl: audio2 || undefined,
      },
      {
        text: scriptArray[2] || "Today, the legacy of the past still echoes in the architecture.",
        imageUrl: image2Url,
        duration: 8000,
        audioUrl: audio3 || undefined,
      },
    ];

    return NextResponse.json({ storyScenes });
  } catch (error) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
}

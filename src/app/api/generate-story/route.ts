import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { name, lat, lng, type } = await request.json();

    // 1. Generate the Script using GPT-4o-mini
    const scriptPrompt = `
      You are a historical documentary narrator. 
      I am looking at a building located at coordinates ${lat}, ${lng}.
      ${name !== "Unknown Building" ? `It is known as or near "${name}".` : ""}
      ${type ? `It is a ${type} building.` : ""}
      
      Write a 3-part short documentary script about the history of this specific building, or if it's a generic building, the history of this specific neighborhood/block in the city.
      
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
      const content = completion.choices[0].message.content || '[]';
      // Clean up potential markdown formatting from the response
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      scriptArray = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse script JSON:", e);
      scriptArray = [
        "This location holds a rich, untold history.",
        "Over the decades, the surrounding neighborhood transformed dramatically.",
        "Today, it remains a vital part of the city's fabric."
      ];
    }

    // 2. Get the Modern Photo (Google Street View)
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    // We use a slight pitch (10) to look up at the building
    const modernImageUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&fov=90&heading=235&pitch=10&key=${googleApiKey}`;

    // 3. Generate Historical Photos (DALL-E 3)
    // We generate 2 historical images to match the 3-part script (Modern -> History 1 -> History 2)
    
    // Helper function to generate an image to avoid failing the whole request if one fails
    const generateHistoricalImage = async (prompt: string, fallbackUrl: string) => {
      try {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          style: "natural", // More photorealistic
        });
        return imageResponse.data?.[0]?.url || fallbackUrl;
      } catch (e) {
        console.error("DALL-E generation failed:", e);
        return fallbackUrl;
      }
    };

    console.log("Generating historical images...");

    // Generate Image 1: 1920s Archival Photo
    const image1Url = await generateHistoricalImage(
      `A highly realistic, authentic 1920s black and white archival photograph of a city street corner resembling the architecture at latitude ${lat}, longitude ${lng}. Vintage cars, pedestrians in period clothing. Sepia tone, slight film grain.`,
      "https://images.unsplash.com/photo-1546436836-07a91091f11c?auto=format&fit=crop&w=800&q=80"
    );

    // Generate Image 2: Mid-century or Architectural Sketch
    const image2Url = await generateHistoricalImage(
      `A highly detailed, vintage architectural blueprint sketch of a building resembling the structure at latitude ${lat}, longitude ${lng}. Drawn on aged, slightly yellowed paper with precise linework.`,
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
    );

    // 4. Generate Voiceover (Text-to-Speech)
    console.log("Generating voiceover...");
    let audioBase64 = "";
    try {
      // Combine the script parts into one seamless narrative
      const fullScript = scriptArray.join(" ");
      
      const mp3 = await openai.audio.speech.create({
        model: "tts-1", // Standard TTS model (fast and cheap)
        voice: "onyx", // Onyx is a deep, authoritative voice perfect for documentaries
        input: fullScript,
      });
      
      // Convert the audio buffer to a Base64 string so we can send it directly to the browser
      // This avoids needing an S3 bucket for a hackathon MVP!
      const buffer = Buffer.from(await mp3.arrayBuffer());
      audioBase64 = `data:audio/mp3;base64,${buffer.toString('base64')}`;
    } catch (e) {
      console.error("TTS generation failed:", e);
    }

    // 5. Assemble the final StoryScenes array
    const storyScenes = [
      {
        text: scriptArray[0] || "Exploring the history of this location...",
        imageUrl: modernImageUrl,
        duration: 6000,
      },
      {
        text: scriptArray[1] || "Decades ago, this area looked vastly different.",
        imageUrl: image1Url,
        duration: 6000,
      },
      {
        text: scriptArray[2] || "Today, the legacy of the past still echoes in the architecture.",
        imageUrl: image2Url,
        duration: 6000,
      }
    ];

    return NextResponse.json({ 
      storyScenes,
      audioUrl: audioBase64 || undefined
    });

  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}

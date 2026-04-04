import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateNarrationAudio(text: string): Promise<string> {
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

function decodeGooglePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

async function fetchRouteCoordinates(
  landmarks: Array<{ lat: number; lng: number }>
): Promise<Array<{ lat: number; lng: number }>> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey || landmarks.length < 2) return [];

  try {
    const origin = `${landmarks[0].lat},${landmarks[0].lng}`;
    const destination = `${landmarks[landmarks.length - 1].lat},${landmarks[landmarks.length - 1].lng}`;
    const waypointCoords = landmarks.slice(1, -1).map((l) => `${l.lat},${l.lng}`);

    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${apiKey}`;
    if (waypointCoords.length > 0) {
      url += `&waypoints=${waypointCoords.join("|")}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" || !data.routes?.length) return [];

    // Decode each step's polyline for high-detail road geometry
    const allPoints: Array<{ lat: number; lng: number }> = [];
    for (const leg of data.routes[0].legs) {
      for (const step of leg.steps) {
        const stepPoints = decodeGooglePolyline(step.polyline.points);
        if (allPoints.length > 0 && stepPoints.length > 0) {
          stepPoints.shift(); // avoid duplicate at junction
        }
        allPoints.push(...stepPoints);
      }
    }
    return allPoints;
  } catch (e) {
    console.error("Route directions fetch failed:", e);
    return [];
  }
}

async function resolvePhotoUrl(photoRef: string, apiKey: string): Promise<string> {
  const redirectUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1280&photo_reference=${photoRef}&key=${apiKey}`;
  try {
    // Follow the redirect server-side to get the stable lh3.googleusercontent.com URL.
    // This avoids client-side redirect/CORS issues that cause broken images.
    const res = await fetch(redirectUrl, { redirect: "follow" });
    if (res.ok && res.url) return res.url;
  } catch (_) {
    /* fall through to raw URL */
  }
  return redirectUrl;
}

async function fetchLandmarkPhoto(name: string, cityName: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return "";

  // Strategy 1: Text Search (broader, returns more candidates with photos)
  const queries = [`${name} ${cityName}`, name];
  for (const query of queries) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
      );
      const data = await res.json();
      const results = data.results || [];
      for (const result of results.slice(0, 3)) {
        const photoRef = result.photos?.[0]?.photo_reference;
        if (photoRef) return resolvePhotoUrl(photoRef, apiKey);
      }
    } catch (e) {
      console.error("Text search photo failed for:", query, e);
    }
  }

  // Strategy 2: Find Place From Text (original approach, as last resort)
  try {
    const findRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(`${name} ${cityName}`)}&inputtype=textquery&fields=photos&key=${apiKey}`
    );
    const findData = await findRes.json();
    const photoRef = findData.candidates?.[0]?.photos?.[0]?.photo_reference;
    if (photoRef) return resolvePhotoUrl(photoRef, apiKey);
  } catch (e) {
    console.error("Find place photo failed for:", name, e);
  }

  return "";
}

export async function POST(request: Request) {
  try {
    const { cityName, lat, lng } = await request.json();

    const prompt = `You write narration for a travel documentary. Dry, witty, specific — think Anthony Bourdain or a BBC narrator, not a tourism brochure.

City: "${cityName}" (center: ${lat}, ${lng}).

Pick 5 real, well-known landmarks or buildings within ~3 km of center. Mix old and new.

For each, write ONE narration sentence (20-30 words). Rules:
- Lead with a concrete fact, date, or number — not an adjective.
- No "testament to", "stands as", "where X meets Y", "bustling", "vibrant", or "rich tapestry".
- Sound like a human who's actually been there, not a chatbot.

Write a short intro line (under 15 words). Same rules — dry and specific, no hype.

Return JSON:
{
  "intro": "Short intro line.",
  "landmarks": [
    { "name": "Exact Landmark Name", "lat": 00.0000, "lng": 00.0000, "narration": "One sentence." }
  ]
}

Coordinates must be accurate — they drive a 3D camera flyover.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(content);

    const intro = parsed.intro || `Welcome to ${cityName}.`;
    const landmarks = Array.isArray(parsed.landmarks) ? parsed.landmarks : [];

    if (landmarks.length === 0) {
      return NextResponse.json(
        { error: "No landmarks generated" },
        { status: 500 }
      );
    }

    // Generate TTS + fetch photos + fetch road route in parallel
    const allTexts = [intro, ...landmarks.map((l: any) => l.narration)];
    const [audioResults, photoResults, routeCoordinates] = await Promise.all([
      Promise.all(allTexts.map(generateNarrationAudio)),
      Promise.all(landmarks.map((l: any) => fetchLandmarkPhoto(l.name, cityName))),
      fetchRouteCoordinates(landmarks),
    ]);

    const introAudio = audioResults[0];
    const landmarksWithAssets = landmarks.map((landmark: any, i: number) => ({
      name: landmark.name,
      lat: landmark.lat,
      lng: landmark.lng,
      narration: landmark.narration,
      audioUrl: audioResults[i + 1] || undefined,
      photoUrl: photoResults[i] || undefined,
    }));

    return NextResponse.json({
      cityName,
      intro,
      introAudio: introAudio || undefined,
      landmarks: landmarksWithAssets,
      routeCoordinates: routeCoordinates.length > 0 ? routeCoordinates : undefined,
    });
  } catch (error) {
    console.error("Error generating journey:", error);
    return NextResponse.json(
      { error: "Failed to generate journey" },
      { status: 500 }
    );
  }
}

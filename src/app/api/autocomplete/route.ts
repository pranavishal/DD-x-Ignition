import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ predictions: [] });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key is missing");
    }

    // Call Google Places API (Legacy) Autocomplete
    // Using the legacy endpoint since it's the one enabled on the API key
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&key=${apiKey}`
    );
    
    const data = await res.json();

    // Map the response format to match what the frontend expects
    const predictions = data.predictions?.map((p: any) => ({
      description: p.description
    })) || [];

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error('Error fetching autocomplete:', error);
    return NextResponse.json({ predictions: [], error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key is missing");
    }

    // Call Google Places API (Legacy) FindPlace
    // This is the endpoint that is enabled on your key
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(address)}&inputtype=textquery&fields=geometry,formatted_address&key=${apiKey}`
    );
    
    const data = await res.json();

    if (data.candidates && data.candidates.length > 0) {
      const { lat, lng } = data.candidates[0].geometry.location;
      const name = data.candidates[0].formatted_address;
      return NextResponse.json({ lat, lng, name });
    } else {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching geocode:', error);
    return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 });
  }
}

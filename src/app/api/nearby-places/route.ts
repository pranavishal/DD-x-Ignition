import { NextResponse } from "next/server";
import { getSeedSpots } from "@/data/mockSpots";

const TYPE_TO_CATEGORY: Record<string, string> = {
  restaurant: "food",
  cafe: "food",
  bakery: "food",
  bar: "nightlife",
  night_club: "nightlife",
  museum: "historic",
  church: "historic",
  park: "nature",
  art_gallery: "art",
  tourist_attraction: "hidden-gem",
};

export async function POST(request: Request) {
  try {
    const { lat, lng, radius = 1500 } = await request.json();
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ spots: getSeedSpots("Nearby"), fallback: true });
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=restaurant|bar|cafe|museum|art_gallery|tourist_attraction|park&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.results?.length) {
      return NextResponse.json({ spots: getSeedSpots("Nearby"), fallback: true });
    }

    const spots = data.results.slice(0, 12).map((place: Record<string, unknown>, i: number) => {
      const types = (place.types as string[]) || [];
      const matchedType = types.find((t) => TYPE_TO_CATEGORY[t]);
      const category = matchedType ? TYPE_TO_CATEGORY[matchedType] : "hidden-gem";

      const photos = place.photos as Array<{ photo_reference: string }> | undefined;
      const photoRef = photos?.[0]?.photo_reference;
      const photoUrl = photoRef
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${photoRef}&key=${apiKey}`
        : "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80";

      // Seed first 2 spots near 49 likes for demo coupon mechanic
      const likes = i < 2 ? 48 + Math.floor(Math.random() * 2) : Math.floor(Math.random() * 40);

      const geometry = place.geometry as { location: { lat: number; lng: number } };

      return {
        id: `gplace-${place.place_id}`,
        name: place.name as string,
        description: (place.vicinity as string) || `A popular ${category} spot nearby.`,
        location: (place.vicinity as string) || "Nearby",
        photoUrl,
        category,
        coordinates: {
          lat: geometry.location.lat,
          lng: geometry.location.lng,
        },
        likes,
        couponUnlocked: false,
        submittedAt: new Date(Date.now() - Math.random() * 604800000).toISOString(),
      };
    });

    return NextResponse.json({ spots, fallback: false });
  } catch (error) {
    console.error("Nearby places fetch failed:", error);
    return NextResponse.json({ spots: getSeedSpots("Nearby"), fallback: true });
  }
}

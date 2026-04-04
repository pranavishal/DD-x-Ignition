import { NextResponse } from "next/server";
import { MOCK_LISTINGS } from "@/data/mock-rentals";

/**
 * GET /api/rentals/listing/:id
 *
 * Returns a single RentalListing by ID.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = MOCK_LISTINGS.find((l) => l.id === id);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json(listing);
}

import { NextResponse } from "next/server";
import { MOCK_LISTINGS, clusterListings } from "@/data/mock-rentals";
import type { RentalListing, RentalSearchFilters } from "@/types/rentals";

/**
 * GET /api/rentals/search?lat=...&lng=...&radius=5&priceMin=0&priceMax=500&type=apartment,hotel&source=airbnb&stayLength=short&tags=student-friendly&sortBy=price
 *
 * Returns { clusters: BuildingCluster[], totalListings: number }.
 * Swap MOCK_LISTINGS for real scraper calls when ready.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const filters: RentalSearchFilters = {
    lat: searchParams.get("lat") ? Number(searchParams.get("lat")) : undefined,
    lng: searchParams.get("lng") ? Number(searchParams.get("lng")) : undefined,
    radius: searchParams.get("radius") ? Number(searchParams.get("radius")) : 5,
    priceMin: searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : undefined,
    priceMax: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined,
    type: searchParams.get("type")?.split(",") as RentalSearchFilters["type"],
    source: searchParams.get("source")?.split(",") as RentalSearchFilters["source"],
    stayLength: searchParams.get("stayLength") as RentalSearchFilters["stayLength"],
    tags: searchParams.get("tags")?.split(","),
    sortBy: (searchParams.get("sortBy") as RentalSearchFilters["sortBy"]) ?? "price",
  };

  let results: RentalListing[] = [...MOCK_LISTINGS];

  // --- Filter pipeline ---

  if (filters.priceMin !== undefined) {
    results = results.filter((l) => l.price >= filters.priceMin!);
  }
  if (filters.priceMax !== undefined) {
    results = results.filter((l) => l.price <= filters.priceMax!);
  }
  if (filters.type?.length) {
    results = results.filter((l) => filters.type!.includes(l.type));
  }
  if (filters.source?.length) {
    results = results.filter((l) => filters.source!.includes(l.source));
  }
  if (filters.stayLength) {
    const unitMap = { short: "night", medium: "week", long: "month" } as const;
    const unit = unitMap[filters.stayLength];
    results = results.filter((l) => l.priceUnit === unit);
  }
  if (filters.tags?.length) {
    results = results.filter((l) =>
      filters.tags!.some((tag) => l.tags.includes(tag))
    );
  }

  // --- Sort ---

  if (filters.sortBy === "price") {
    results.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === "rating") {
    results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }

  const clusters = clusterListings(results);

  return NextResponse.json({
    clusters,
    totalListings: results.length,
  });
}

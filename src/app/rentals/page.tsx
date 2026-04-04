"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import RentalsMap from "@/components/rentals/RentalsMap";
import ListingPanel from "@/components/rentals/ListingPanel";
import FilterBar from "@/components/rentals/FilterBar";
import type { BuildingCluster, RentalListing, RentalSearchFilters } from "@/types/rentals";
import { Camera, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RentalsPage() {
  const [clusters, setClusters] = useState<BuildingCluster[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [selectedCluster, setSelectedCluster] = useState<BuildingCluster | null>(null);
  const [selectedListing, setSelectedListing] = useState<RentalListing | null>(null);
  const [filters, setFilters] = useState<RentalSearchFilters>({});
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async (f: RentalSearchFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.priceMin !== undefined) params.set("priceMin", String(f.priceMin));
      if (f.priceMax !== undefined) params.set("priceMax", String(f.priceMax));
      if (f.type?.length) params.set("type", f.type.join(","));
      if (f.source?.length) params.set("source", f.source.join(","));
      if (f.stayLength) params.set("stayLength", f.stayLength);
      if (f.tags?.length) params.set("tags", f.tags.join(","));
      if (f.sortBy) params.set("sortBy", f.sortBy);

      const res = await fetch(`/api/rentals/search?${params.toString()}`);
      const data = await res.json();
      setClusters(data.clusters ?? []);
      setTotalListings(data.totalListings ?? 0);
    } catch (err) {
      console.error("Failed to fetch rentals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(filters);
  }, [filters, fetchListings]);

  const handleFilterChange = (newFilters: RentalSearchFilters) => {
    setFilters(newFilters);
    setSelectedCluster(null);
    setSelectedListing(null);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center justify-between p-4 pointer-events-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div>
              <h1 className="text-lg font-bold drop-shadow-lg">
                Rentals & Stays
              </h1>
              <p className="text-xs text-white/60">
                {loading
                  ? "Searching..."
                  : `${totalListings} listings in ${clusters.length} buildings`}
              </p>
            </div>
          </div>

          <Link
            href="/rentals/ar"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-medium text-sm transition-colors"
          >
            <Camera className="w-4 h-4" />
            AR View
          </Link>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 pointer-events-auto">
          <FilterBar filters={filters} onChange={handleFilterChange} />
        </div>
      </div>

      {/* CesiumJS Map with rental clusters */}
      <RentalsMap
        clusters={clusters}
        onClusterSelect={(cluster) => {
          setSelectedCluster(cluster);
          setSelectedListing(null);
        }}
      />

      {/* Slide-out listing panel */}
      <AnimatePresence>
        {selectedCluster && (
          <ListingPanel
            cluster={selectedCluster}
            selectedListing={selectedListing}
            onSelectListing={setSelectedListing}
            onClose={() => {
              setSelectedCluster(null);
              setSelectedListing(null);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

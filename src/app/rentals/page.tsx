"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import RentalsMap from "@/components/rentals/RentalsMap";
import ListingPanel from "@/components/rentals/ListingPanel";
import FilterBar from "@/components/rentals/FilterBar";
import type { BuildingCluster, RentalListing, RentalSearchFilters } from "@/types/rentals";
import { Camera, ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export default function RentalsPage() {
  const [clusters, setClusters] = useState<BuildingCluster[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [selectedCluster, setSelectedCluster] = useState<BuildingCluster | null>(null);
  const [selectedListing, setSelectedListing] = useState<RentalListing | null>(null);
  const [filters, setFilters] = useState<RentalSearchFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async (f: RentalSearchFilters) => {
    setLoading(true);
    setError(null);
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
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setClusters(data.clusters ?? []);
      setTotalListings(data.totalListings ?? 0);
    } catch {
      setError("Could not load listings. Please try again.");
      setClusters([]);
      setTotalListings(0);
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

  const hasActiveFilters =
    (filters.type?.length ?? 0) > 0 ||
    (filters.source?.length ?? 0) > 0 ||
    filters.stayLength !== undefined ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    (filters.tags?.length ?? 0) > 0;

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* Top bar — floating glass panel over the map */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center justify-between p-4 pointer-events-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-200"
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
                  : error
                    ? "Something went wrong"
                    : totalListings === 0
                      ? "No listings match your filters"
                      : `${totalListings} listing${totalListings !== 1 ? "s" : ""} across ${clusters.length} building${clusters.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          <Link
            href="/rentals/ar"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-600/25"
          >
            <Camera className="w-4 h-4" />
            AR View
          </Link>
        </div>

        <div className="px-4 pb-3 pointer-events-auto">
          <FilterBar filters={filters} onChange={handleFilterChange} />
        </div>
      </div>

      {/* CesiumJS Map */}
      <RentalsMap
        clusters={clusters}
        onClusterSelect={(cluster) => {
          setSelectedCluster(cluster);
          setSelectedListing(null);
        }}
      />

      {/*
       * Empty state overlay — shown when filters produce zero results.
       *
       * UX rationale: a blank map with no bubbles gives zero feedback.
       * The user might think the app is broken. This overlay explains
       * why nothing is showing and gives a clear action (clear filters).
       * It's semi-transparent so the map is still visible underneath,
       * maintaining spatial context.
       */}
      <AnimatePresence>
        {!loading && !error && totalListings === 0 && hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="bg-gray-950/90 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5 text-center max-w-sm shadow-2xl">
              <SearchX className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-sm font-medium text-white/80 mb-1">
                No listings match your filters
              </p>
              <p className="text-xs text-white/40 mb-4">
                Try broadening your search — adjust price range, property type, or stay duration.
              </p>
              <button
                onClick={() => handleFilterChange({})}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-4 py-2 rounded-full transition-all duration-200"
              >
                Clear all filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="bg-red-950/90 backdrop-blur-xl border border-red-500/20 rounded-2xl px-6 py-5 text-center max-w-sm shadow-2xl">
              <p className="text-sm font-medium text-red-300 mb-1">{error}</p>
              <button
                onClick={() => fetchListings(filters)}
                className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-full transition-all duration-200 mt-2"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

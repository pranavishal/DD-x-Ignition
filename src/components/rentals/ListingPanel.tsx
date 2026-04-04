"use client";

import { motion } from "framer-motion";
import { X, Building2, DollarSign, MapPin, TrendingDown } from "lucide-react";
import type { BuildingCluster, RentalListing } from "@/types/rentals";
import ListingCard from "./ListingCard";

interface ListingPanelProps {
  cluster: BuildingCluster;
  selectedListing: RentalListing | null;
  onSelectListing: (listing: RentalListing) => void;
  onClose: () => void;
}

/*
 * The panel slides from the right on desktop (where horizontal space is plentiful)
 * and from the bottom on mobile (where vertical thumb-reach matters more).
 * This follows the "sheet" pattern from iOS/Android where detail views slide up
 * from the bottom on phones, keeping the user's thumb near the controls.
 *
 * On desktop it's 420px wide — wide enough to show listing cards with images
 * without feeling cramped, narrow enough to keep most of the map visible.
 */
export default function ListingPanel({
  cluster,
  selectedListing,
  onSelectListing,
  onClose,
}: ListingPanelProps) {
  const priceLabel =
    cluster.priceRange.min === cluster.priceRange.max
      ? `$${cluster.priceRange.min}`
      : `$${cluster.priceRange.min} – $${cluster.priceRange.max.toLocaleString()}`;

  const sources = [...new Set(cluster.listings.map((l) => l.source))];

  return (
    <>
      {/* Backdrop — mobile only. Tapping outside the panel closes it. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 z-25 sm:hidden"
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute top-0 right-0 h-full w-full sm:w-[420px] z-30 bg-gray-950/95 backdrop-blur-xl border-l border-white/10 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-white truncate">
                {cluster.buildingName}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-white/50">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {cluster.listingCount} listing{cluster.listingCount !== 1 && "s"}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  {priceLabel}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-white/40 mb-3">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{cluster.listings[0]?.address ?? "Unknown location"}</span>
          </div>

          {/* Source pills — shows which platforms have listings here */}
          <div className="flex flex-wrap gap-1.5">
            {sources.map((s) => (
              <span
                key={s}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10 capitalize"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Price comparison hint */}
          {cluster.listingCount > 1 &&
            cluster.priceRange.max > cluster.priceRange.min && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-2.5 py-1.5">
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                Compare {cluster.listingCount} options — prices range {priceLabel}
              </div>
            )}
        </div>

        {/* Listing cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {cluster.listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSelected={selectedListing?.id === listing.id}
              onSelect={() => onSelectListing(listing)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 text-center text-xs text-white/25 shrink-0">
          Prices shown per listing · Click a card for details
        </div>
      </motion.div>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import { X, Building2, DollarSign, MapPin } from "lucide-react";
import type { BuildingCluster, RentalListing } from "@/types/rentals";
import ListingCard from "./ListingCard";

interface ListingPanelProps {
  cluster: BuildingCluster;
  selectedListing: RentalListing | null;
  onSelectListing: (listing: RentalListing) => void;
  onClose: () => void;
}

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

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute top-0 right-0 h-full w-full sm:w-[400px] z-30 bg-gray-950/95 backdrop-blur-xl border-l border-white/10 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white truncate">
              {cluster.buildingName}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
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
            className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <MapPin className="w-3 h-3" />
          {cluster.listings[0]?.address ?? "Unknown location"}
        </div>
      </div>

      {/* Listing cards (scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cluster.listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isSelected={selectedListing?.id === listing.id}
            onSelect={() => onSelectListing(listing)}
          />
        ))}
      </div>

      {/* Footer with compare hint */}
      {cluster.listingCount > 1 && (
        <div className="p-3 border-t border-white/10 text-center text-xs text-white/30 shrink-0">
          Click a listing for details · Prices vary by source & duration
        </div>
      )}
    </motion.div>
  );
}

"use client";

import { Star, ExternalLink } from "lucide-react";
import type { RentalListing } from "@/types/rentals";

interface ListingCardProps {
  listing: RentalListing;
  isSelected: boolean;
  onSelect: () => void;
}

const SOURCE_COLORS: Record<string, string> = {
  airbnb: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  booking: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  hotels: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  zillow: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  craigslist: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  other: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export default function ListingCard({ listing, isSelected, onSelect }: ListingCardProps) {
  const priceLabel =
    listing.priceUnit === "month"
      ? `$${listing.price.toLocaleString()}/mo`
      : listing.priceUnit === "week"
        ? `$${listing.price}/wk`
        : `$${listing.price}/night`;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50"
          : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
      }`}
    >
      {/* Image */}
      {listing.images[0] && (
        <div className="relative h-32 overflow-hidden">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                SOURCE_COLORS[listing.source] ?? SOURCE_COLORS.other
              }`}
            >
              {listing.source}
            </span>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
            <span className="text-sm font-bold text-white">{priceLabel}</span>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-semibold text-white leading-tight line-clamp-1">
          {listing.title}
        </h3>
        <p className="text-xs text-white/50 line-clamp-2">{listing.description}</p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-white/60">
            {listing.rating && (
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                {listing.rating}
                {listing.reviewCount && (
                  <span className="text-white/40">({listing.reviewCount})</span>
                )}
              </span>
            )}
            {listing.type && (
              <span className="capitalize">{listing.type}</span>
            )}
            {listing.bedrooms !== undefined && (
              <span>
                {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms}BR`}
              </span>
            )}
          </div>

          <a
            href={listing.listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Tags */}
        {listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {listing.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

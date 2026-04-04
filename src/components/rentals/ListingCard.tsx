"use client";

import { useState } from "react";
import { Star, ExternalLink, ChevronLeft, ChevronRight, Bed, Bath, Users } from "lucide-react";
import type { RentalListing } from "@/types/rentals";

interface ListingCardProps {
  listing: RentalListing;
  isSelected: boolean;
  onSelect: () => void;
}

/*
 * Source badge colors — each rental platform gets a recognizable tint.
 * Warm tones for marketplace sources (Airbnb, Craigslist), cool tones
 * for aggregator/hotel sources (Booking, Hotels.com). This helps users
 * visually scan and compare across sources without reading text.
 */
const SOURCE_COLORS: Record<string, string> = {
  airbnb: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  booking: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  hotels: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  zillow: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  craigslist: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  bamboo: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  places4students: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  other: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const SOURCE_LABELS: Record<string, string> = {
  airbnb: "Airbnb",
  booking: "Booking",
  hotels: "Hotels.com",
  zillow: "Zillow",
  craigslist: "Craigslist",
  bamboo: "BambooHousing",
  places4students: "Places4Students",
  other: "Other",
};

export default function ListingCard({ listing, isSelected, onSelect }: ListingCardProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const hasMultipleImages = listing.images.length > 1;

  const priceLabel =
    listing.priceUnit === "month"
      ? `$${listing.price.toLocaleString()}/mo`
      : listing.priceUnit === "week"
        ? `$${listing.price}/wk`
        : `$${listing.price}/night`;

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i === 0 ? listing.images.length - 1 : i - 1));
  };

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i === listing.images.length - 1 ? 0 : i + 1));
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border transition-all duration-200 overflow-hidden group ${
        isSelected
          ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/40"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20"
      }`}
    >
      {/* Image with carousel */}
      {listing.images[0] && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={listing.images[imgIndex]}
            alt={listing.title}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Carousel arrows — only visible on hover when multiple images exist */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImg}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-white" />
              </button>
              <button
                onClick={nextImg}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-3.5 h-3.5 text-white" />
              </button>
              {/* Dot indicators */}
              <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex gap-1">
                {listing.images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === imgIndex ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Source badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                SOURCE_COLORS[listing.source] ?? SOURCE_COLORS.other
              }`}
            >
              {SOURCE_LABELS[listing.source] ?? listing.source}
            </span>
          </div>

          {/* Price badge — anchored bottom-right over the image gradient */}
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            <span className="text-sm font-bold text-white">{priceLabel}</span>
          </div>
        </div>
      )}

      {/* Card body */}
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-semibold text-white leading-tight line-clamp-1">
          {listing.title}
        </h3>
        <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
          {listing.description}
        </p>

        {/* Meta row — rating, property details, external link */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2.5 text-xs text-white/60">
            {listing.rating && (
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                {listing.rating}
                {listing.reviewCount && (
                  <span className="text-white/35">({listing.reviewCount})</span>
                )}
              </span>
            )}
            {listing.bedrooms !== undefined && (
              <span className="flex items-center gap-0.5">
                <Bed className="w-3 h-3" />
                {listing.bedrooms === 0 ? "Studio" : listing.bedrooms}
              </span>
            )}
            {listing.bathrooms !== undefined && (
              <span className="flex items-center gap-0.5">
                <Bath className="w-3 h-3" />
                {listing.bathrooms}
              </span>
            )}
            {listing.maxGuests !== undefined && (
              <span className="flex items-center gap-0.5">
                <Users className="w-3 h-3" />
                {listing.maxGuests}
              </span>
            )}
          </div>

          <a
            href={listing.listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-400 hover:text-blue-300 transition-colors p-0.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Tags */}
        {listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {listing.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className={`text-[10px] px-1.5 py-0.5 rounded-md border ${
                  tag === "student-friendly"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : tag === "budget"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-white/5 text-white/40 border-white/10"
                }`}
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

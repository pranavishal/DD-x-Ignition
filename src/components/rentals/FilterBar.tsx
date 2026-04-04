"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import type { RentalSearchFilters, RentalType, RentalSource, StayLength } from "@/types/rentals";

interface FilterBarProps {
  filters: RentalSearchFilters;
  onChange: (filters: RentalSearchFilters) => void;
}

const TYPES: { value: RentalType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "studio", label: "Studio" },
  { value: "room", label: "Room" },
  { value: "hotel", label: "Hotel" },
  { value: "hostel", label: "Hostel" },
  { value: "house", label: "House" },
];

const SOURCES: { value: RentalSource; label: string }[] = [
  { value: "airbnb", label: "Airbnb" },
  { value: "booking", label: "Booking" },
  { value: "hotels", label: "Hotels.com" },
  { value: "zillow", label: "Zillow" },
  { value: "craigslist", label: "Craigslist" },
];

/*
 * Stay length pills map to priceUnit in the data.
 * "Nightly" = short-term travelers, "Weekly" = medium stays,
 * "Monthly" = student exchanges & relocations (BambooHousing-style).
 * This is the primary filter most users will reach for first,
 * so it lives in the always-visible collapsed bar.
 */
const STAY_LENGTHS: { value: StayLength; label: string }[] = [
  { value: "short", label: "Nightly" },
  { value: "medium", label: "Weekly" },
  { value: "long", label: "Monthly" },
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleType = (t: RentalType) => {
    const current = filters.type ?? [];
    const next = current.includes(t)
      ? current.filter((x) => x !== t)
      : [...current, t];
    onChange({ ...filters, type: next.length ? next : undefined });
  };

  const toggleSource = (s: RentalSource) => {
    const current = filters.source ?? [];
    const next = current.includes(s)
      ? current.filter((x) => x !== s)
      : [...current, s];
    onChange({ ...filters, source: next.length ? next : undefined });
  };

  const setStayLength = (sl: StayLength) => {
    onChange({
      ...filters,
      stayLength: filters.stayLength === sl ? undefined : sl,
    });
  };

  const activeCount =
    (filters.type?.length ?? 0) +
    (filters.source?.length ?? 0) +
    (filters.stayLength ? 1 : 0) +
    (filters.priceMin !== undefined ? 1 : 0) +
    (filters.priceMax !== undefined ? 1 : 0) +
    (filters.tags?.length ?? 0);

  const clearAll = () => onChange({});

  return (
    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      {/* Always-visible collapsed bar */}
      <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 shrink-0 ${
            expanded
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="bg-white/20 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center ml-0.5">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {STAY_LENGTHS.map((sl) => (
          <button
            key={sl.value}
            onClick={() => setStayLength(sl.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 shrink-0 ${
              filters.stayLength === sl.value
                ? "bg-blue-600/80 border-blue-500 text-white shadow-sm shadow-blue-500/20"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            {sl.label}
          </button>
        ))}

        <button
          onClick={() => {
            const hasTags = filters.tags?.includes("student-friendly");
            onChange({
              ...filters,
              tags: hasTags
                ? filters.tags!.filter((t) => t !== "student-friendly")
                : [...(filters.tags ?? []), "student-friendly"],
            });
          }}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 shrink-0 ${
            filters.tags?.includes("student-friendly")
              ? "bg-emerald-600/80 border-emerald-500 text-white shadow-sm shadow-emerald-500/20"
              : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          Student Mode
        </button>

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 shrink-0 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Expanded filter panel — animated open/close */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 px-4 py-3 space-y-4">
              <div>
                <p className="text-[11px] text-white/40 mb-2 font-medium uppercase tracking-wider">
                  Property Type
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => toggleType(t.value)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                        filters.type?.includes(t.value)
                          ? "bg-blue-600/80 border-blue-500 text-white"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] text-white/40 mb-2 font-medium uppercase tracking-wider">
                  Source
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SOURCES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => toggleSource(s.value)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                        filters.source?.includes(s.value)
                          ? "bg-purple-600/80 border-purple-500 text-white"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] text-white/40 mb-2 font-medium uppercase tracking-wider">
                  Price Range
                </p>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...filters,
                          priceMin: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-28 bg-white/5 border border-white/10 text-white text-xs pl-6 pr-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-white/25 transition-all"
                    />
                  </div>
                  <span className="text-white/20 text-xs">to</span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...filters,
                          priceMax: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-28 bg-white/5 border border-white/10 text-white text-xs pl-6 pr-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-white/25 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

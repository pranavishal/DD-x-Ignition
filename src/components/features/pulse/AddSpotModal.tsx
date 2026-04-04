"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin } from "lucide-react";
import { UniqueSpot } from "@/types";

interface AddSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (spot: UniqueSpot) => void;
  defaultCoords: { lat: number; lng: number };
  cityName: string;
}

const categories: UniqueSpot["category"][] = [
  "food",
  "art",
  "nature",
  "nightlife",
  "hidden-gem",
  "historic",
];

export default function AddSpotModal({
  isOpen,
  onClose,
  onSubmit,
  defaultCoords,
  cityName,
}: AddSpotModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<UniqueSpot["category"]>("hidden-gem");
  const [photoUrl, setPhotoUrl] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) return;

    const spot: UniqueSpot = {
      id: `spot-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      location: cityName,
      photoUrl: photoUrl.trim() || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80",
      category,
      coordinates: defaultCoords,
      likes: 0,
      couponUnlocked: false,
      submittedAt: new Date().toISOString(),
    };

    onSubmit(spot);
    setName("");
    setDescription("");
    setCategory("hidden-gem");
    setPhotoUrl("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add a Unique Spot</h3>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Name */}
            <input
              type="text"
              placeholder="Spot name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-purple-500/50"
            />

            {/* Description */}
            <textarea
              placeholder="What makes this place special?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-purple-500/50 resize-none"
            />

            {/* Category */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    category === cat
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  {cat.replace("-", " ")}
                </button>
              ))}
            </div>

            {/* Photo URL */}
            <input
              type="text"
              placeholder="Photo URL (optional)"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-purple-500/50"
            />

            {/* Location */}
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location: {cityName} ({defaultCoords.lat.toFixed(4)}, {defaultCoords.lng.toFixed(4)})</span>
            </div>

            {/* Submit */}
            <motion.button
              onClick={handleSubmit}
              whileTap={{ scale: 0.98 }}
              disabled={!name.trim() || !description.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Share This Spot
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { StoryScene } from "../../types";

interface StoryPlayerProps {
  scenes: StoryScene[];
  audioUrl?: string;
}

export default function StoryPlayer({ scenes, audioUrl }: StoryPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle Audio Initialization
  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.loop = false;
      audioRef.current.volume = 0.5;
      
      // Attempt to play immediately (might be blocked by browser autoplay policies)
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("Autoplay blocked or interrupted:", e);
          // If autoplay is blocked, we can optionally show a "Click to unmute" UI
          // but for now we just catch the error so it doesn't crash the console
        });
      }
    }

    return () => {
      if (audioRef.current) {
        // Pause the audio before destroying the component
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [audioUrl]);

  // Handle Scene Progression
  useEffect(() => {
    if (!isPlaying || currentIndex >= scenes.length) return;

    const currentScene = scenes[currentIndex];
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, currentScene.duration);

    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying, scenes]);

  const handleReplay = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.warn("Play blocked:", e));
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (scenes.length === 0) return null;

  const isComplete = currentIndex >= scenes.length;
  const currentScene = isComplete ? scenes[scenes.length - 1] : scenes[currentIndex];

  return (
    <div className="relative w-full h-full bg-black overflow-hidden shadow-inner border border-gray-200">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={currentScene.imageUrl}
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: 1.1, opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{ duration: currentScene.duration / 1000, ease: "linear" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Audio Controls */}
      {audioUrl && (
        <button 
          onClick={toggleMute}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors text-white"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}

      {/* Subtitles */}
      <div className="absolute bottom-0 left-0 w-full p-6">
        <AnimatePresence mode="wait">
          {!isComplete && (
            <motion.p
              key={`text-${currentIndex}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white font-medium text-lg leading-snug drop-shadow-md"
            >
              "{currentScene.text}"
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20">
        <motion.div
          key={`progress-${currentIndex}`}
          initial={{ width: "0%" }}
          animate={{ width: isComplete ? "100%" : "100%" }}
          transition={{ duration: currentScene.duration / 1000, ease: "linear" }}
          className="h-full bg-blue-500"
        />
      </div>

      {/* Completion State / Replay Overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm"
          >
            <p className="text-white font-bold mb-4">Story Complete</p>
            <button
              onClick={handleReplay}
              className="bg-white text-black px-4 py-2 rounded-full font-semibold flex items-center space-x-2 hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

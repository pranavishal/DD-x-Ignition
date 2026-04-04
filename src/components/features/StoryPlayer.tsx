"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { StoryScene } from "../../types";

interface StoryPlayerProps {
  scenes: StoryScene[];
}

export default function StoryPlayer({ scenes }: StoryPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Scene progression: audio-driven when available, timer fallback otherwise
  useEffect(() => {
    if (!isPlaying || currentIndex >= scenes.length) return;

    const scene = scenes[currentIndex];
    let cleanedUp = false;
    let fallbackTimer: ReturnType<typeof setTimeout>;
    setSceneProgress(0);

    const advanceScene = () => {
      if (!cleanedUp) setCurrentIndex((prev) => prev + 1);
    };

    if (scene.audioUrl) {
      const audio = new Audio(scene.audioUrl);
      audio.muted = isMutedRef.current;
      audio.volume = 0.7;
      audioRef.current = audio;

      const handleEnded = () => advanceScene();
      const handleTimeUpdate = () => {
        if (audio.duration > 0) {
          setSceneProgress(audio.currentTime / audio.duration);
        }
      };

      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("timeupdate", handleTimeUpdate);

      // Brief pause so the image fades in before narration begins
      const playDelay = setTimeout(() => {
        audio.play().catch(() => {
          fallbackTimer = setTimeout(advanceScene, scene.duration);
        });
      }, 500);

      return () => {
        cleanedUp = true;
        clearTimeout(playDelay);
        clearTimeout(fallbackTimer);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.pause();
        audio.src = "";
        audioRef.current = null;
      };
    } else {
      // No audio for this scene — use duration-based fallback with progress tracking
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        setSceneProgress(Math.min((Date.now() - startTime) / scene.duration, 1));
      }, 50);

      const timer = setTimeout(advanceScene, scene.duration);

      return () => {
        cleanedUp = true;
        clearInterval(progressInterval);
        clearTimeout(timer);
      };
    }
  }, [currentIndex, isPlaying, scenes]);

  const handleReplay = () => {
    setCurrentIndex(0);
    setSceneProgress(0);
    setIsPlaying(true);
  };

  const toggleMute = () => setIsMuted((prev) => !prev);

  if (scenes.length === 0) return null;

  const isComplete = currentIndex >= scenes.length;
  const currentScene = isComplete ? scenes[scenes.length - 1] : scenes[currentIndex];
  const hasAnyAudio = scenes.some((s) => s.audioUrl);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Image with fast fade + slow Ken Burns zoom */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={currentScene.imageUrl}
          initial={{ scale: 1, opacity: 0 }}
          animate={{
            scale: 1.08,
            opacity: 0.85,
            transition: {
              opacity: { duration: 0.5, ease: "easeOut" },
              scale: { duration: 20, ease: "linear" },
            },
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.3, ease: "easeIn" },
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Segmented progress bar (Instagram stories style) */}
      <div className="absolute top-0 left-0 w-full flex gap-1 px-3 pt-3 z-10">
        {scenes.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[3px] bg-white/25 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-white rounded-full"
              animate={{
                width:
                  i < currentIndex
                    ? "100%"
                    : i === currentIndex
                      ? `${sceneProgress * 100}%`
                      : "0%",
              }}
              transition={{ duration: 0.15, ease: "linear" }}
            />
          </div>
        ))}
      </div>

      {/* Mute toggle */}
      {hasAnyAudio && (
        <button
          onClick={toggleMute}
          className="absolute top-5 right-3 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors text-white"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
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
              transition={{ duration: 0.35 }}
              className="text-white font-medium text-lg leading-snug drop-shadow-md"
            >
              &ldquo;{currentScene.text}&rdquo;
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Completion overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm"
          >
            <p className="text-white font-bold text-lg mb-4">Story Complete</p>
            <button
              onClick={handleReplay}
              className="bg-white text-black px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-200 transition-colors"
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

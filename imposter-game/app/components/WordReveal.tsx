"use client";

import { useState, useCallback, useEffect } from "react";
import { Player } from "../lib/game";

interface WordRevealProps {
  player: Player;
  word: string;
  onNext: () => void;
  isLast: boolean;
}

export function WordReveal({ player, word, onNext, isLast }: WordRevealProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [player.id]);

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleHide = useCallback(() => {
    setRevealed(false);
    onNext();
  }, [onNext]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 p-4">
      {/* Player indicator */}
      <div className="text-center animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-full mb-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-zinc-400 text-sm">Your turn</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">{player.name}</h2>
      </div>

      {!revealed ? (
        <button
          onClick={handleReveal}
          className="group relative w-72 h-72 animate-scale-in"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Card */}
          <div className="relative w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-3xl flex flex-col items-center justify-center gap-4 group-hover:border-blue-500/50 transition-all group-active:scale-95">
            <div className="text-6xl group-hover:scale-110 transition-transform">👁️</div>
            <span className="text-zinc-400 font-medium">Tap to reveal your word</span>
          </div>
        </button>
      ) : (
        <div className="flex flex-col items-center gap-6 animate-scale-in">
          <div
            className={`relative w-72 h-72 rounded-3xl flex flex-col items-center justify-center p-6 overflow-hidden ${
              player.isImposter
                ? "bg-gradient-to-br from-red-950 to-zinc-950 border-2 border-red-700 glow-red"
                : "bg-gradient-to-br from-emerald-950 to-zinc-950 border-2 border-emerald-700 glow-emerald"
            }`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: player.isImposter 
                  ? "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(239,68,68,0.1) 10px, rgba(239,68,68,0.1) 20px)"
                  : "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(16,185,129,0.1) 10px, rgba(16,185,129,0.1) 20px)"
              }} />
            </div>
            
            {player.isImposter ? (
              <div className="relative text-center">
                <div className="text-5xl mb-4">🕵️</div>
                <span className="text-lg font-medium text-red-300/80">You are the</span>
                <div className="text-4xl font-black text-red-200 tracking-wider mt-1">
                  IMPOSTER
                </div>
                <p className="text-red-300/50 text-sm mt-6 max-w-[200px]">
                  Blend in with the others and try to guess the secret word!
                </p>
              </div>
            ) : (
              <div className="relative text-center">
                <span className="text-zinc-400 text-sm uppercase tracking-wider">Your word is</span>
                <div className="text-4xl font-black text-emerald-200 mt-3 break-words max-w-[220px]">
                  {word.toUpperCase()}
                </div>
                <p className="text-emerald-300/50 text-sm mt-6 max-w-[200px]">
                  Find the imposter without revealing the word!
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleHide}
            className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold rounded-xl transition-all active:scale-95"
          >
            {isLast ? "Done — Start Discussion" : "Hide & Pass Device"}
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { getCategoryNames, Category } from "../lib/words";

interface PlayerSetupProps {
  onStart: (players: string[], category?: Category) => void;
}

export function PlayerSetup({ onStart }: PlayerSetupProps) {
  const [players, setPlayers] = useState<string[]>(["", "", ""]);
  const [category, setCategory] = useState<Category | "random">("random");
  const [error, setError] = useState<string | null>(null);

  const categories = getCategoryNames();

  const addPlayer = useCallback(() => {
    if (players.length < 10) {
      setPlayers((prev) => [...prev, ""]);
    }
  }, [players.length]);

  const removePlayer = useCallback((index: number) => {
    if (players.length > 3) {
      setPlayers((prev) => prev.filter((_, i) => i !== index));
    }
  }, [players.length]);

  const updatePlayer = useCallback((index: number, name: string) => {
    setPlayers((prev) => prev.map((p, i) => (i === index ? name : p)));
    setError(null);
  }, []);

  const handleStart = useCallback(() => {
    const validPlayers = players.map((p) => p.trim()).filter((p) => p.length > 0);
    
    if (validPlayers.length < 3) {
      setError("Need at least 3 players");
      return;
    }

    const uniqueNames = new Set(validPlayers.map((p) => p.toLowerCase()));
    if (uniqueNames.size !== validPlayers.length) {
      setError("Player names must be unique");
      return;
    }

    onStart(validPlayers, category === "random" ? undefined : category);
  }, [players, category, onStart]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-3xl">🕵️</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">
          Imposter Word
        </h1>
        <p className="text-zinc-500 text-sm">
          One player gets a different word. Find them!
        </p>
      </div>

      {/* Players section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Players
          </label>
          <span className="text-xs text-zinc-600">{players.length}/10</span>
        </div>
        
        {players.map((player, index) => (
          <div key={index} className="flex gap-2 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm font-mono">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <input
                type="text"
                value={player}
                onChange={(e) => updatePlayer(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                maxLength={20}
              />
            </div>
            {players.length > 3 && (
              <button
                onClick={() => removePlayer(index)}
                className="w-12 h-12 flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                aria-label="Remove player"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {players.length < 10 && (
          <button
            onClick={addPlayer}
            className="w-full py-3.5 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Player
          </button>
        )}
      </div>

      {/* Category section */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Word Category
        </label>
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "random")}
            className="w-full px-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
          >
            <option value="random">🎲 Random (any category)</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryEmoji(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl animate-fade-in">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Start button */}
      <button
        onClick={handleStart}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl transition-all text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98]"
      >
        Start Game
      </button>
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    animals: "🐾",
    food: "🍕",
    household: "🏠",
    clothing: "👕",
    vehicles: "🚗",
    places: "📍",
    sports: "⚽",
    music: "🎵",
    tools: "🔧",
    nature: "🌿",
    body: "🫀",
    jobs: "💼",
    entertainment: "🎬",
    school: "📚",
    office: "💻",
    toys: "🎮",
    technology: "📱",
    weather: "☀️",
    fantasy: "🐉",
    emotions: "💭",
    actions: "🏃",
    time: "⏰",
    colors: "🎨",
    shapes: "⬡",
    materials: "🧱",
    sounds: "🔊",
  };
  return emojis[category] || "📦";
}

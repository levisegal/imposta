"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PlayerSetup } from "./components/PlayerSetup";
import { createGame } from "./lib/game";
import { Category } from "./lib/words";
import { getStats } from "./lib/storage";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalGames: 0, imposterWins: 0, crewWins: 0, winRate: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(getStats());
  }, []);

  const handleStart = useCallback((players: string[], category?: Category) => {
    const game = createGame(players, category);
    sessionStorage.setItem("current-game", JSON.stringify(game));
    router.push("/play");
  }, [router]);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-red-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col justify-center py-8 relative z-10 animate-fade-in">
        <PlayerSetup onStart={handleStart} />
      </div>
      
      {stats.totalGames > 0 && (
        <div className="p-4 border-t border-zinc-800/50 relative z-10 safe-area-bottom">
          <Link 
            href="/history"
            className="block text-center text-gray-500 hover:text-white transition-colors"
          >
            <span className="text-sm">
              📊 {stats.totalGames} games • Crew wins {stats.winRate}%
            </span>
          </Link>
        </div>
      )}
    </main>
  );
}

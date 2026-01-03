"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GameResult } from "../lib/game";
import { getGameHistory, getStats, clearGameHistory } from "../lib/storage";

export default function HistoryPage() {
  const [history, setHistory] = useState<GameResult[]>([]);
  const [stats, setStats] = useState({ totalGames: 0, imposterWins: 0, crewWins: 0, winRate: 0 });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHistory(getGameHistory());
    setStats(getStats());
  }, []);

  const handleClear = () => {
    clearGameHistory();
    setHistory([]);
    setStats({ totalGames: 0, imposterWins: 0, crewWins: 0, winRate: 0 });
    setShowClearConfirm(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-md mx-auto p-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Back
          </Link>
          <h1 className="text-xl font-bold">History</h1>
          <div className="w-16" />
        </div>

        {/* Stats card */}
        {stats.totalGames > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 animate-fade-in">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold font-mono">{stats.totalGames}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Games</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-mono text-emerald-400">{stats.crewWins}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Crew</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-mono text-red-400">{stats.imposterWins}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Imposter</div>
              </div>
            </div>
            
            {/* Win rate bar */}
            <div className="mt-5">
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                  style={{ width: `${stats.winRate}%` }}
                />
              </div>
              <div className="text-center text-xs text-zinc-500 mt-2">
                Crew win rate: <span className="text-emerald-400 font-medium">{stats.winRate}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {history.length === 0 ? (
          <div className="text-center text-zinc-500 py-16 animate-fade-in">
            <div className="text-5xl mb-4">📊</div>
            <p className="mb-4">No games played yet!</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              Start a game
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,6 15,12 9,18" />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            {/* Game list */}
            <div className="flex flex-col gap-3">
              {history.map((game, index) => (
                <div
                  key={game.id}
                  className={`p-4 rounded-xl border animate-slide-up ${
                    game.winnersAreImposters
                      ? "bg-red-950/20 border-red-900/30"
                      : "bg-emerald-950/20 border-emerald-900/30"
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-lg">{game.word}</span>
                      {game.category && (
                        <span className="text-zinc-500 text-sm ml-2">
                          ({game.category})
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        game.winnersAreImposters
                          ? "bg-red-900/40 text-red-300 border border-red-800/50"
                          : "bg-emerald-900/40 text-emerald-300 border border-emerald-800/50"
                      }`}
                    >
                      {game.winnersAreImposters ? "🕵️ Won" : "👥 Won"}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-400">
                    <span>Imposter: <span className="text-zinc-300">{game.imposterName}</span></span>
                    {game.imposterCaught && <span className="text-emerald-400 ml-2">(caught!)</span>}
                  </div>
                  <div className="text-xs text-zinc-600 mt-2 flex justify-between">
                    <span>{game.players.length} players</span>
                    <span>{formatDate(game.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear history */}
            <div className="mt-8 text-center">
              {showClearConfirm ? (
                <div className="flex gap-2 justify-center animate-fade-in">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm transition-colors"
                  >
                    Yes, clear all
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
                >
                  Clear history
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

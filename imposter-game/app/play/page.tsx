"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { WordReveal } from "../components/WordReveal";
import { VotePanel, ResultPanel } from "../components/VotePanel";
import {
  GameState,
  getCurrentPlayer,
  revealWord,
  startVoting,
  skipToResult,
  castVote,
  createGame,
  createGameResult,
} from "../lib/game";
import { saveGameResult } from "../lib/storage";

export default function PlayPage() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuickVote, setShowQuickVote] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("current-game");
    if (stored) {
      try {
        setGame(JSON.parse(stored));
      } catch {
        router.push("/");
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  const handleRevealNext = useCallback(() => {
    setGame((prev) => {
      if (!prev) return prev;
      return revealWord(prev);
    });
  }, []);

  const handleStartVoting = useCallback(() => {
    setGame((prev) => {
      if (!prev) return prev;
      return startVoting(prev);
    });
  }, []);

  const handleShowQuickVote = useCallback(() => {
    setShowQuickVote(true);
  }, []);

  const handleQuickVote = useCallback((accusedId: string) => {
    setGame((prev) => {
      if (!prev) return prev;
      // Record the group's accusation as if everyone voted for this person
      let updated = { ...prev, votingSkipped: true };
      for (const player of prev.players) {
        updated = castVote(updated, player.id, accusedId);
      }
      updated = { ...updated, phase: "result" as const };
      const result = createGameResult(updated);
      saveGameResult(result);
      return updated;
    });
    setShowQuickVote(false);
  }, []);

  const handleVote = useCallback((voterId: string, suspectId: string) => {
    setGame((prev) => {
      if (!prev) return prev;
      const updated = castVote(prev, voterId, suspectId);
      
      if (updated.phase === "result") {
        const result = createGameResult(updated);
        saveGameResult(result);
      }
      
      return updated;
    });
  }, []);

  const handlePlayAgain = useCallback(() => {
    if (!game) return;
    
    const playerNames = game.players.map((p) => p.name);
    const newGame = createGame(playerNames, game.category ?? undefined);
    sessionStorage.setItem("current-game", JSON.stringify(newGame));
    setGame(newGame);
  }, [game]);

  const handleHome = useCallback(() => {
    sessionStorage.removeItem("current-game");
    router.push("/");
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!game) {
    return null;
  }

  const currentPlayer = getCurrentPlayer(game);
  const progressPercent = 
    game.phase === "reveal"
      ? (game.currentPlayerIndex / game.players.length) * 33
      : game.phase === "discuss"
      ? 33
      : game.phase === "vote"
      ? 33 + (Object.keys(game.votes).length / game.players.length) * 33
      : 100;

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-blue-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 safe-area-top">
        <div className="h-1 bg-zinc-900">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="pt-6 relative z-10">
        {game.phase === "reveal" && currentPlayer && (
          <WordReveal
            player={currentPlayer}
            word={game.word}
            onNext={handleRevealNext}
            isLast={game.currentPlayerIndex === game.players.length - 1}
          />
        )}

        {game.phase === "discuss" && (
          <div className="flex flex-col items-center justify-center min-h-[85vh] gap-8 p-4 animate-fade-in">
            <div className="text-center">
              <div className="text-7xl mb-6">💬</div>
              <h2 className="text-3xl font-bold mb-3">Discussion Time</h2>
              <p className="text-zinc-500 max-w-xs mx-auto">
                Take turns giving one-word clues. Try to find who doesn&apos;t know the word!
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
                Players in this round
              </h3>
              <div className="flex flex-wrap gap-2">
                {game.players.map((player) => (
                  <span
                    key={player.id}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-sm"
                  >
                    {player.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
              <button
                onClick={handleStartVoting}
                className="w-full px-10 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-semibold rounded-xl transition-all text-lg shadow-lg shadow-yellow-500/20 active:scale-95"
              >
                🗳️ Start Voting
              </button>
              <button
                onClick={handleShowQuickVote}
                className="w-full px-10 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all border border-zinc-700 active:scale-95"
              >
                🎯 We&apos;ve Decided
              </button>
            </div>
          </div>
        )}

        {game.phase === "discuss" && showQuickVote && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold text-center mb-2">Who&apos;s the Imposter?</h3>
              <p className="text-zinc-500 text-sm text-center mb-6">
                Select who the group thinks is the imposter
              </p>
              <div className="flex flex-col gap-2">
                {game.players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleQuickVote(player.id)}
                    className="w-full px-4 py-3 bg-zinc-800 hover:bg-red-900/50 hover:border-red-700 border border-zinc-700 rounded-xl text-left font-medium transition-all active:scale-95"
                  >
                    {player.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowQuickVote(false)}
                className="w-full mt-4 px-4 py-2 text-zinc-500 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {game.phase === "vote" && (
          <VotePanel game={game} onVote={handleVote} />
        )}

        {game.phase === "result" && (
          <ResultPanel
            game={game}
            onPlayAgain={handlePlayAgain}
            onHome={handleHome}
          />
        )}
      </div>
    </main>
  );
}

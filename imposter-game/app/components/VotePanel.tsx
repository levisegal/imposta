"use client";

import { useState, useCallback } from "react";
import { Player, GameState, getVoteResults, getImposter, checkWinner } from "../lib/game";

interface VotePanelProps {
  game: GameState;
  onVote: (voterId: string, suspectId: string) => void;
}

export function VotePanel({ game, onVote }: VotePanelProps) {
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentVoter = game.players[currentVoterIndex];
  const hasVoted = currentVoter ? game.votes[currentVoter.id] !== undefined : true;

  const handleSelect = useCallback((suspectId: string) => {
    setSelectedSuspect(suspectId);
    setShowConfirm(true);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!currentVoter || !selectedSuspect) return;
    
    onVote(currentVoter.id, selectedSuspect);
    setSelectedSuspect(null);
    setShowConfirm(false);
    
    if (currentVoterIndex < game.players.length - 1) {
      setCurrentVoterIndex((i) => i + 1);
    }
  }, [currentVoter, selectedSuspect, onVote, currentVoterIndex, game.players.length]);

  const handleCancel = useCallback(() => {
    setSelectedSuspect(null);
    setShowConfirm(false);
  }, []);

  if (hasVoted && currentVoterIndex >= game.players.length - 1) {
    return null;
  }

  if (showConfirm && selectedSuspect) {
    const suspect = game.players.find((p) => p.id === selectedSuspect);
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 p-4 animate-fade-in">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">{currentVoter?.name}</h2>
          <p className="text-zinc-500">Confirm your vote?</p>
        </div>
        
        <div className="w-64 h-36 bg-gradient-to-br from-yellow-900/30 to-zinc-900 border-2 border-yellow-600/50 rounded-2xl flex items-center justify-center glow-yellow">
          <span className="text-3xl font-bold text-yellow-200">{suspect?.name}</span>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/20"
          >
            Vote for {suspect?.name}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 min-h-[80vh] justify-center animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-4">
          <span className="text-lg">🗳️</span>
          <span className="text-yellow-300/80 text-sm">Vote {currentVoterIndex + 1} of {game.players.length}</span>
        </div>
        <h2 className="text-2xl font-bold mb-1">{currentVoter?.name}&apos;s Vote</h2>
        <p className="text-zinc-500 text-sm">Who do you think is the imposter?</p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {game.players
          .filter((p) => p.id !== currentVoter?.id)
          .map((player, index) => (
            <button
              key={player.id}
              onClick={() => handleSelect(player.id)}
              className="w-full py-4 px-6 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-yellow-600/50 rounded-xl text-left transition-all active:scale-[0.98] animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-lg font-medium">{player.name}</span>
            </button>
          ))}
      </div>
    </div>
  );
}

interface ResultPanelProps {
  game: GameState;
  onPlayAgain: () => void;
  onHome: () => void;
}

export function ResultPanel({ game, onPlayAgain, onHome }: ResultPanelProps) {
  const imposter = getImposter(game);
  const results = getVoteResults(game);
  const { imposterWins, reason } = checkWinner(game);
  const skipped = game.votingSkipped;

  return (
    <div className="flex flex-col items-center gap-6 p-4 min-h-[80vh] justify-center animate-fade-in">
      {/* Result banner */}
      {skipped ? (
        <div
          className={`w-full max-w-sm p-8 rounded-3xl text-center relative overflow-hidden ${
            imposterWins
              ? "bg-gradient-to-br from-red-950 to-zinc-950 border-2 border-red-700 glow-red"
              : "bg-gradient-to-br from-emerald-950 to-zinc-950 border-2 border-emerald-700 glow-emerald"
          }`}
        >
          {!imposterWins && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-emerald-400/30"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
          <div className="relative">
            <div className="text-5xl mb-4">{imposterWins ? "😈" : "🎉"}</div>
            <h2 className={`text-3xl font-bold mb-2 ${imposterWins ? "text-red-200" : "text-emerald-200"}`}>
              {imposterWins ? "Wrong!" : "Correct!"}
            </h2>
            <p className={`text-lg mt-2 ${imposterWins ? "text-red-300/80" : "text-emerald-300/80"}`}>
              The imposter was <span className="font-bold">{imposter?.name}</span>
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`w-full max-w-sm p-8 rounded-3xl text-center relative overflow-hidden ${
            imposterWins
              ? "bg-gradient-to-br from-red-950 to-zinc-950 border-2 border-red-700 glow-red"
              : "bg-gradient-to-br from-emerald-950 to-zinc-950 border-2 border-emerald-700 glow-emerald"
          }`}
        >
          {/* Confetti-like decoration for crew wins */}
          {!imposterWins && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-emerald-400/30"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
          
          <div className="relative">
            <div className="text-5xl mb-4">{imposterWins ? "🕵️" : "🎉"}</div>
            <h2 className={`text-3xl font-bold mb-2 ${imposterWins ? "text-red-200" : "text-emerald-200"}`}>
              {imposterWins ? "Imposter Wins!" : "Crew Wins!"}
            </h2>
            <p className={`text-sm ${imposterWins ? "text-red-300/60" : "text-emerald-300/60"}`}>
              {reason}
            </p>
          </div>
        </div>
      )}

      {/* Vote results - only show if voting happened */}
      {!skipped && (
        <div className="w-full max-w-sm">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 text-center">
            Vote Results
          </h3>
          <div className="flex flex-col gap-2">
            {results.map(({ playerId, votes }, index) => {
              const player = game.players.find((p) => p.id === playerId);
              const isImposter = player?.isImposter;
              return (
                <div
                  key={playerId}
                  className={`flex justify-between items-center px-4 py-3 rounded-xl animate-slide-up ${
                    isImposter 
                      ? "bg-red-900/20 border border-red-800/50" 
                      : "bg-zinc-900 border border-zinc-800"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className={`font-medium ${isImposter ? "text-red-300" : ""}`}>
                    {player?.name} {isImposter && <span className="text-red-400">🕵️</span>}
                  </span>
                  <span className="text-zinc-500 font-mono">
                    {votes} vote{votes !== 1 ? "s" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* The secret word */}
      <div className="text-center">
        <p className="text-zinc-500 text-sm mb-2">The word was</p>
        <div className="text-3xl font-bold text-blue-300 font-mono">
          {game.word.toUpperCase()}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onHome}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl transition-all"
        >
          Home
        </button>
        <button
          onClick={onPlayAgain}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

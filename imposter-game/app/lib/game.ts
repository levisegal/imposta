import { getRandomWord, Category } from "./words";

export interface Player {
  id: string;
  name: string;
  isImposter: boolean;
  hasRevealed: boolean;
  votedFor: string | null;
}

export interface GameState {
  id: string;
  players: Player[];
  word: string;
  category: Category | null;
  phase: "setup" | "reveal" | "discuss" | "vote" | "result";
  currentPlayerIndex: number;
  votes: Record<string, string>;
  votingSkipped: boolean;
  createdAt: number;
}

export interface GameResult {
  id: string;
  word: string;
  category: Category | null;
  players: string[];
  imposterName: string;
  imposterGuessedWord: string | null;
  imposterCaught: boolean;
  imposterGuessedCorrectly: boolean;
  winnersAreImposters: boolean;
  createdAt: number;
}

export function createGame(playerNames: string[], category?: Category): GameState {
  const imposterIndex = Math.floor(Math.random() * playerNames.length);
  
  const players: Player[] = playerNames.map((name, index) => ({
    id: generateId(),
    name,
    isImposter: index === imposterIndex,
    hasRevealed: false,
    votedFor: null,
  }));

  // Shuffle players so imposter position isn't predictable based on entry order
  shuffleArray(players);

  return {
    id: generateId(),
    players,
    word: getRandomWord(category),
    category: category ?? null,
    phase: "reveal",
    currentPlayerIndex: 0,
    votes: {},
    votingSkipped: false,
    createdAt: Date.now(),
  };
}

export function getCurrentPlayer(game: GameState): Player | null {
  if (game.currentPlayerIndex >= game.players.length) {
    return null;
  }
  return game.players[game.currentPlayerIndex];
}

export function revealWord(game: GameState): GameState {
  const currentPlayer = getCurrentPlayer(game);
  if (!currentPlayer) return game;

  const updatedPlayers = game.players.map((p) =>
    p.id === currentPlayer.id ? { ...p, hasRevealed: true } : p
  );

  const nextIndex = game.currentPlayerIndex + 1;
  const allRevealed = nextIndex >= game.players.length;

  return {
    ...game,
    players: updatedPlayers,
    currentPlayerIndex: nextIndex,
    phase: allRevealed ? "discuss" : "reveal",
  };
}

export function startVoting(game: GameState): GameState {
  return {
    ...game,
    phase: "vote",
    votes: {},
  };
}

export function skipToResult(game: GameState): GameState {
  return {
    ...game,
    phase: "result",
    votes: {},
    votingSkipped: true,
  };
}

export function castVote(game: GameState, voterId: string, suspectId: string): GameState {
  const newVotes = { ...game.votes, [voterId]: suspectId };
  
  const updatedPlayers = game.players.map((p) =>
    p.id === voterId ? { ...p, votedFor: suspectId } : p
  );

  const allVoted = Object.keys(newVotes).length === game.players.length;

  return {
    ...game,
    players: updatedPlayers,
    votes: newVotes,
    phase: allVoted ? "result" : "vote",
  };
}

export function getVoteResults(game: GameState): { playerId: string; votes: number }[] {
  const voteCounts: Record<string, number> = {};
  
  for (const suspectId of Object.values(game.votes)) {
    voteCounts[suspectId] = (voteCounts[suspectId] || 0) + 1;
  }

  return game.players
    .map((p) => ({ playerId: p.id, votes: voteCounts[p.id] || 0 }))
    .sort((a, b) => b.votes - a.votes);
}

export function getMostVotedPlayer(game: GameState): Player | null {
  const results = getVoteResults(game);
  if (results.length === 0) return null;

  const maxVotes = results[0].votes;
  const topVoted = results.filter((r) => r.votes === maxVotes);

  // Tie goes to no one being eliminated (imposter wins tie)
  if (topVoted.length > 1) return null;

  return game.players.find((p) => p.id === topVoted[0].playerId) || null;
}

export function getImposter(game: GameState): Player | null {
  return game.players.find((p) => p.isImposter) || null;
}

export function checkWinner(game: GameState): { imposterWins: boolean; reason: string } {
  const mostVoted = getMostVotedPlayer(game);
  const imposter = getImposter(game);

  if (!imposter) {
    return { imposterWins: false, reason: "No imposter found" };
  }

  if (!mostVoted) {
    return { imposterWins: true, reason: "Vote was tied - imposter escapes!" };
  }

  if (mostVoted.id === imposter.id) {
    return { imposterWins: false, reason: `${imposter.name} was caught! The word was "${game.word}"` };
  }

  return { imposterWins: true, reason: `${mostVoted.name} was wrongly accused! ${imposter.name} was the imposter.` };
}

export function createGameResult(game: GameState, imposterGuess?: string): GameResult {
  const imposter = getImposter(game);
  const { imposterWins } = checkWinner(game);
  const imposterGuessedCorrectly = imposterGuess?.toLowerCase().trim() === game.word.toLowerCase();

  return {
    id: game.id,
    word: game.word,
    category: game.category,
    players: game.players.map((p) => p.name),
    imposterName: imposter?.name || "Unknown",
    imposterGuessedWord: imposterGuess || null,
    imposterCaught: !imposterWins,
    imposterGuessedCorrectly,
    winnersAreImposters: imposterWins || imposterGuessedCorrectly,
    createdAt: game.createdAt,
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


import { GameResult } from "./game";

const HISTORY_KEY = "imposter-game-history";
const MAX_HISTORY = 100;

export function saveGameResult(result: GameResult): void {
  if (typeof window === "undefined") return;
  
  const history = getGameHistory();
  history.unshift(result);
  
  // Keep only the most recent games
  if (history.length > MAX_HISTORY) {
    history.length = MAX_HISTORY;
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getGameHistory(): GameResult[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data) as GameResult[];
  } catch {
    return [];
  }
}

export function clearGameHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

export function getStats(): {
  totalGames: number;
  imposterWins: number;
  crewWins: number;
  winRate: number;
} {
  const history = getGameHistory();
  const totalGames = history.length;
  const imposterWins = history.filter((g) => g.winnersAreImposters).length;
  const crewWins = totalGames - imposterWins;
  const winRate = totalGames > 0 ? Math.round((crewWins / totalGames) * 100) : 0;

  return { totalGames, imposterWins, crewWins, winRate };
}


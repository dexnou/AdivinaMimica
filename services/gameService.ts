
import { Category, Player, Team } from "../types";
import { DEFAULT_CATEGORIES, STORAGE_KEY_CATEGORIES } from "../constants";

// --- Storage ---

export const getCategories = (): Category[] => {
  const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
  if (!stored) {
    // Initialize with defaults if empty
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
};

// --- Game Logic ---

export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateTeams = (players: Player[], teamCount: number): Team[] => {
  const shuffledPlayers = shuffleArray(players);
  const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
    id: `team_${i}`,
    name: `Equipo ${i + 1}`,
    players: [],
    score: 0,
    nextActorIndex: 0 // Initialize rotation index
  }));

  // Distribute players round-robin
  shuffledPlayers.forEach((player, index) => {
    const teamIndex = index % teamCount;
    teams[teamIndex].players.push(player);
  });

  return teams;
};

export const getNextActors = (team: Team, count: number): Player[] => {
  // Select players sequentially based on nextActorIndex
  const actors: Player[] = [];
  const totalPlayers = team.players.length;
  
  for (let i = 0; i < count; i++) {
    const index = (team.nextActorIndex + i) % totalPlayers;
    actors.push(team.players[index]);
  }
  
  return actors;
};

export const getRandomCard = (category: Category, usedCards: string[]): string | null => {
  const available = category.cards.filter(c => !usedCards.includes(c));
  
  if (available.length === 0) {
    // Return null to signal that there are no more unique cards
    return null;
  }
  
  return available[Math.floor(Math.random() * available.length)];
};

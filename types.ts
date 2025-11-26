
export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  score: number;
  nextActorIndex: number; // New: Tracks who is next in the rotation
}

export interface Card {
  id: string;
  text: string;
}

export interface Category {
  id: string;
  name: string;
  cards: string[]; // Stores raw text strings for cards
}

export enum GameStep {
  HOME = 'HOME',
  ADMIN = 'ADMIN',
  SELECT_CATEGORY = 'SELECT_CATEGORY',
  SETUP_PLAYERS = 'SETUP_PLAYERS',
  SETUP_TEAMS = 'SETUP_TEAMS',
  SETUP_ACTORS = 'SETUP_ACTORS',
  GAME_LOOP = 'GAME_LOOP',
  RESULTS = 'RESULTS'
}

export enum TurnPhase {
  STANDBY = 'STANDBY', // Showing who's turn it is
  CARD_REVEAL = 'CARD_REVEAL', // Showing the card
  TIMER = 'TIMER', // Timer running
  SCORE_UPDATE = 'SCORE_UPDATE' // Intermediate screen to show score changes
}

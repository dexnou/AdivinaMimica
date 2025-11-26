export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  score: number;
  nextActorIndex: number;
}

export interface CardItem {
  id: string | number; // Flexible para aceptar ambos
  text: string;
}

export interface Category {
  id: string | number; // Flexible para aceptar ambos
  name: string;
  cards: CardItem[];
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
  STANDBY = 'STANDBY',
  CARD_REVEAL = 'CARD_REVEAL',
  TIMER = 'TIMER',
  SCORE_UPDATE = 'SCORE_UPDATE'
}
export type PlayerRole = "Batsman" | "Bowler" | "All-rounder" | "Wicketkeeper";
export type UserRole = "Auctioneer" | "Team Owner" | "Viewer";
export type AuctionStatus = "not_started" | "in_progress" | "paused" | "completed";

export interface Player {
  id: string;
  name: string;
  nationality: string;
  role: PlayerRole;
  age: number;
  basePrice: number;
  image: string;
  status: "Available" | "Sold";
  soldTo?: string;
  soldAmount?: number;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  players: Player[];
  budget: number;
}

export interface AuctionState {
  status: AuctionStatus;
  currentTeamId: string | null;
  currentPlayer: Player | null;
  teams: Team[];
  availablePlayers: Player[];
  soldPlayers: Player[];
}
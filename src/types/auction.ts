export type PlayerRole = "Batsman" | "Bowler" | "All-rounder" | "Wicketkeeper";
export type UserRole = "Auctioneer" | "Team Owner" | "Viewer";
export type DraftStatus = "not_started" | "in_progress" | "paused" | "completed";

export interface Player {
  id: string;
  name: string;
  nationality: string;
  role: PlayerRole;
  age: number;
  status: "Available" | "Pending" | "Selected";
  team_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  players: Player[];
  budget: number;
}

export interface DraftState {
  status: DraftStatus;
  currentTeamId: string | null;
  currentPlayer: Player | null;
  teams: Team[];
  availablePlayers: Player[];
  selectedPlayers: Player[];
}
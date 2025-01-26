export type UserRole = "Team Owner" | "Auctioneer" | "Spectator";

export interface TeamOwnerViewProps {
  roomId: string;
}

export interface AuctioneerViewProps {
  roomId: string;
}

export interface DraftState {
  status: "not_started" | "in_progress" | "paused" | "completed";
  currentTeamId: string | null;
  currentPlayer: Player | null;
  teams: Team[];
  availablePlayers: Player[];
  selectedPlayers: Player[];
}

export interface Player {
  id: string;
  name: string;
  nationality: string;
  role: string;
  age: number;
  base_price: number;
  status: "Available" | "Pending" | "Sold";
  team_id?: string | null;
  sold_amount?: number | null;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  budget: number;
}
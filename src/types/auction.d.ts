export interface AuctioneerViewProps {
  roomId: string;
}

export interface TeamOwnerViewProps {
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

export interface DraftControlsProps {
  status: DraftState['status'];
  onStart: () => void;
  onPause: () => void;
  onNext: () => void;
  onEnd: () => void;
}

export interface StatusCardProps {
  status: DraftState['status'];
  currentTeam?: Team;
  availablePlayersCount: number;
  selectedPlayersCount: number;
}

export interface TeamSummaryProps {
  teams: Team[];
  selectedPlayers: Player[];
}

export interface PlayersTableProps {
  players: Player[];
}

export interface TeamSelectionProps {
  teams: Team[];
  onTeamSelect: (teamId: string) => void;
}

export interface PlayerSelectionTableProps {
  players: Player[];
  selectedPlayerId: string | null;
  onPlayerSelect: (playerId: string) => void;
  isMyTurn: boolean;
}

export interface TeamActionsProps {
  onSubmitSelection: () => void;
  onPassTurn: () => void;
  isSubmitting: boolean;
  isMyTurn: boolean;
  selectedPlayerId: string | null;
}
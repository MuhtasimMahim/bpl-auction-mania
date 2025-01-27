import { Player } from './player';
import { Team } from './team';

export type DraftStatus = "not_started" | "in_progress" | "paused" | "completed";

export interface DraftState {
  status: DraftStatus;
  currentTeamId: string | null;
  currentPlayer: Player | null;
  teams: Team[];
  availablePlayers: Player[];
  selectedPlayers: Player[];
}

export interface AuctioneerViewProps {
  roomId: string;
}

export interface TeamOwnerViewProps {
  roomId: string;
}

export interface DraftControlsProps {
  status: DraftStatus;
  onStart: () => void;
  onPause: () => void;
  onNext: () => void;
  onEnd: () => void;
}

export interface StatusCardProps {
  status: DraftStatus;
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
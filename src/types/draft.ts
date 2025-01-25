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
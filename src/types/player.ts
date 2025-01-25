export type PlayerRole = "Batsman" | "Bowler" | "All-rounder" | "Wicketkeeper";

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
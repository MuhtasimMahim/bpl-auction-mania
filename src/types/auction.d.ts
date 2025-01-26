export type UserRole = "Team Owner" | "Auctioneer" | "Spectator";

export interface TeamOwnerViewProps {
  roomId: string;
}

export interface AuctioneerViewProps {
  roomId: string;
}
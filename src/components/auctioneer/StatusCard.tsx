import { Card } from "@/components/ui/card";
import { StatusCardProps } from "@/types/auction";

export const StatusCard = ({
  status,
  currentTeam,
  availablePlayersCount,
  selectedPlayersCount,
}: StatusCardProps) => {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold">Current Status</h3>
      <div className="space-y-2">
        <p>Status: {status}</p>
        <p>Current Team: {currentTeam?.name || "None"}</p>
        <p>Available Players: {availablePlayersCount}</p>
        <p>Selected Players: {selectedPlayersCount}</p>
      </div>
    </div>
  );
};
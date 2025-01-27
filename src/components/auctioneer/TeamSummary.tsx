import { TeamSummaryProps } from "@/types/auction";

export const TeamSummary = ({ teams, selectedPlayers }: TeamSummaryProps) => {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold">Team Summary</h3>
      <div className="space-y-2">
        {teams?.map((team) => (
          <div key={team.id} className="flex justify-between">
            <span>{team.name}</span>
            <span>
              Players: {selectedPlayers.filter((p) => p.team_id === team.id).length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
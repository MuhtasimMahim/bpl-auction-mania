import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamSelectionProps } from "@/types/auction";

export const TeamSelection = ({ teams, onTeamSelect }: TeamSelectionProps) => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Select Your Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams?.map((team) => (
          <Card
            key={team.id}
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onTeamSelect(team.id)}
          >
            <CardHeader>
              <CardTitle className="text-xl">{team.name}</CardTitle>
              <p className="text-sm text-gray-500">
                Budget: ${team.budget.toLocaleString()}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
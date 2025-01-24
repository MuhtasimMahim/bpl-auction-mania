import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mockPlayers, mockTeams } from "@/data/mockData";
import { DraftState, Player, Team } from "@/types/auction";

export const AuctioneerView = () => {
  const { toast } = useToast();
  const [draftState, setDraftState] = useState<DraftState>({
    status: "not_started",
    currentTeamId: null,
    currentPlayer: null,
    teams: mockTeams,
    availablePlayers: mockPlayers,
    selectedPlayers: [],
  });

  const startDraft = () => {
    if (draftState.status !== "not_started") {
      toast({
        title: "Error",
        description: "Draft has already started",
        variant: "destructive",
      });
      return;
    }

    const randomTeamIndex = Math.floor(Math.random() * mockTeams.length);
    setDraftState((prev) => ({
      ...prev,
      status: "in_progress",
      currentTeamId: mockTeams[randomTeamIndex].id,
    }));

    toast({
      title: "Draft Started",
      description: `First pick: ${mockTeams[randomTeamIndex].name}`,
    });
  };

  const pauseDraft = () => {
    setDraftState((prev) => ({
      ...prev,
      status: prev.status === "paused" ? "in_progress" : "paused",
    }));

    toast({
      title: draftState.status === "paused" ? "Draft Resumed" : "Draft Paused",
    });
  };

  const endDraft = () => {
    setDraftState((prev) => ({
      ...prev,
      status: "completed",
      currentTeamId: null,
      currentPlayer: null,
    }));

    toast({
      title: "Draft Completed",
      description: "All team rosters have been finalized",
    });
  };

  const getCurrentTeam = (): Team | undefined => {
    return draftState.teams.find((team) => team.id === draftState.currentTeamId);
  };

  const moveToNextTeam = () => {
    const currentIndex = draftState.teams.findIndex(
      (team) => team.id === draftState.currentTeamId
    );
    const nextIndex = (currentIndex + 1) % draftState.teams.length;
    
    setDraftState((prev) => ({
      ...prev,
      currentTeamId: draftState.teams[nextIndex].id,
    }));

    toast({
      title: "Next Team's Turn",
      description: `Current pick: ${draftState.teams[nextIndex].name}`,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Draft Manager Dashboard</h2>
        <div className="space-x-4">
          {draftState.status === "not_started" && (
            <Button onClick={startDraft}>Start Draft</Button>
          )}
          {(draftState.status === "in_progress" || draftState.status === "paused") && (
            <>
              <Button onClick={pauseDraft}>
                {draftState.status === "paused" ? "Resume Draft" : "Pause Draft"}
              </Button>
              <Button onClick={moveToNextTeam}>Next Team</Button>
              <Button variant="destructive" onClick={endDraft}>
                End Draft
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Status */}
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold">Current Status</h3>
          <div className="space-y-2">
            <p>Status: {draftState.status}</p>
            <p>Current Team: {getCurrentTeam()?.name || "None"}</p>
            <p>Available Players: {draftState.availablePlayers.length}</p>
            <p>Selected Players: {draftState.selectedPlayers.length}</p>
          </div>
        </div>

        {/* Team Summary */}
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold">Team Summary</h3>
          <div className="space-y-2">
            {draftState.teams.map((team) => (
              <div key={team.id} className="flex justify-between">
                <span>{team.name}</span>
                <span>Players: {team.players.length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Players Table */}
      <div className="border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Available Players</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {draftState.availablePlayers.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>{player.nationality}</TableCell>
                <TableCell>{player.role}</TableCell>
                <TableCell>{player.age}</TableCell>
                <TableCell>{player.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
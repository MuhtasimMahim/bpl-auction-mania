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
import { AuctionState, Player, Team } from "@/types/auction";

export const AuctioneerView = () => {
  const { toast } = useToast();
  const [auctionState, setAuctionState] = useState<AuctionState>({
    status: "not_started",
    currentTeamId: null,
    currentPlayer: null,
    teams: mockTeams,
    availablePlayers: mockPlayers,
    soldPlayers: [],
  });

  const startAuction = () => {
    if (auctionState.status !== "not_started") {
      toast({
        title: "Error",
        description: "Auction has already started",
        variant: "destructive",
      });
      return;
    }

    const randomTeamIndex = Math.floor(Math.random() * mockTeams.length);
    setAuctionState((prev) => ({
      ...prev,
      status: "in_progress",
      currentTeamId: mockTeams[randomTeamIndex].id,
    }));

    toast({
      title: "Auction Started",
      description: `First turn: ${mockTeams[randomTeamIndex].name}`,
    });
  };

  const pauseAuction = () => {
    setAuctionState((prev) => ({
      ...prev,
      status: prev.status === "paused" ? "in_progress" : "paused",
    }));

    toast({
      title: auctionState.status === "paused" ? "Auction Resumed" : "Auction Paused",
    });
  };

  const endAuction = () => {
    setAuctionState((prev) => ({
      ...prev,
      status: "completed",
      currentTeamId: null,
      currentPlayer: null,
    }));

    toast({
      title: "Auction Completed",
      description: "All team rosters have been finalized",
    });
  };

  const getCurrentTeam = (): Team | undefined => {
    return auctionState.teams.find((team) => team.id === auctionState.currentTeamId);
  };

  const moveToNextTeam = () => {
    const currentIndex = auctionState.teams.findIndex(
      (team) => team.id === auctionState.currentTeamId
    );
    const nextIndex = (currentIndex + 1) % auctionState.teams.length;
    
    setAuctionState((prev) => ({
      ...prev,
      currentTeamId: auctionState.teams[nextIndex].id,
    }));

    toast({
      title: "Next Team's Turn",
      description: `Current turn: ${auctionState.teams[nextIndex].name}`,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Auctioneer Dashboard</h2>
        <div className="space-x-4">
          {auctionState.status === "not_started" && (
            <Button onClick={startAuction}>Start Auction</Button>
          )}
          {(auctionState.status === "in_progress" || auctionState.status === "paused") && (
            <>
              <Button onClick={pauseAuction}>
                {auctionState.status === "paused" ? "Resume Auction" : "Pause Auction"}
              </Button>
              <Button onClick={moveToNextTeam}>Next Team</Button>
              <Button variant="destructive" onClick={endAuction}>
                End Auction
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
            <p>Status: {auctionState.status}</p>
            <p>Current Team: {getCurrentTeam()?.name || "None"}</p>
            <p>Available Players: {auctionState.availablePlayers.length}</p>
            <p>Sold Players: {auctionState.soldPlayers.length}</p>
          </div>
        </div>

        {/* Team Summary */}
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold">Team Summary</h3>
          <div className="space-y-2">
            {auctionState.teams.map((team) => (
              <div key={team.id} className="flex justify-between">
                <span>{team.name}</span>
                <span>Players: {team.players.length}</span>
                <span>Budget: ${team.budget.toLocaleString()}</span>
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
              <TableHead>Base Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auctionState.availablePlayers.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>{player.nationality}</TableCell>
                <TableCell>{player.role}</TableCell>
                <TableCell>{player.age}</TableCell>
                <TableCell>${player.basePrice.toLocaleString()}</TableCell>
                <TableCell>{player.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
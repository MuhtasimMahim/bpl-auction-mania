import { useState, useEffect } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DraftState, Player, Team } from "@/types/auction";

export const AuctioneerView = () => {
  const { toast } = useToast();
  const [draftState, setDraftState] = useState<DraftState>({
    status: "not_started",
    currentTeamId: null,
    currentPlayer: null,
    teams: [],
    availablePlayers: [],
    selectedPlayers: [],
  });

  // Fetch teams and players
  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Team[];
    },
  });

  const { data: players } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Player[];
    },
  });

  // Subscribe to auction status changes
  useEffect(() => {
    const channel = supabase
      .channel('auction-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'auction_status' },
        (payload) => {
          console.log('Received auction status update:', payload);
          setDraftState(prev => ({
            ...prev,
            status: payload.new.status as DraftState['status'],
            currentTeamId: payload.new.current_team_id,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch initial auction status
  useEffect(() => {
    const fetchAuctionStatus = async () => {
      const { data, error } = await supabase
        .from("auction_status")
        .select("*")
        .single();
      
      if (error) {
        console.error("Error fetching auction status:", error);
        return;
      }

      if (data) {
        console.log('Initial auction status:', data);
        setDraftState(prev => ({
          ...prev,
          status: data.status as DraftState['status'],
          currentTeamId: data.current_team_id,
        }));
      }
    };

    fetchAuctionStatus();
  }, []);

  const startDraft = async () => {
    console.log('Starting draft...');
    if (!teams?.length) {
      toast({
        title: "Error",
        description: "No teams available to start the draft",
        variant: "destructive",
      });
      return;
    }

    const randomTeamIndex = Math.floor(Math.random() * teams.length);
    const randomTeam = teams[randomTeamIndex];

    try {
      const { error } = await supabase
        .from("auction_status")
        .update({
          status: "in_progress",
          current_team_id: randomTeam.id,
        })
        .eq("id", "1");

      if (error) {
        console.error('Error starting draft:', error);
        toast({
          title: "Error",
          description: "Failed to start draft: " + error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Draft started successfully');
      toast({
        title: "Draft Started",
        description: `First pick: ${randomTeam.name}`,
      });
    } catch (err) {
      console.error('Unexpected error starting draft:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while starting the draft",
        variant: "destructive",
      });
    }
  };

  const pauseDraft = async () => {
    const newStatus = draftState.status === "paused" ? "in_progress" : "paused";
    
    const { error } = await supabase
      .from("auction_status")
      .update({
        status: newStatus,
      })
      .eq("id", "1");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update draft status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: draftState.status === "paused" ? "Draft Resumed" : "Draft Paused",
    });
  };

  const endDraft = async () => {
    const { error } = await supabase
      .from("auction_status")
      .update({
        status: "completed",
        current_team_id: null,
      })
      .eq("id", "1");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to end draft",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Draft Completed",
      description: "All team rosters have been finalized",
    });
  };

  const getCurrentTeam = (): Team | undefined => {
    return teams?.find((team) => team.id === draftState.currentTeamId);
  };

  const moveToNextTeam = async () => {
    if (!teams?.length) return;

    const currentIndex = teams.findIndex(
      (team) => team.id === draftState.currentTeamId
    );
    const nextIndex = (currentIndex + 1) % teams.length;
    const nextTeam = teams[nextIndex];
    
    const { error } = await supabase
      .from("auction_status")
      .update({
        current_team_id: nextTeam.id,
      })
      .eq("id", "1");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to move to next team",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Next Team's Turn",
      description: `Current pick: ${nextTeam.name}`,
    });
  };

  const availablePlayers = players?.filter(p => p.status === "Available") || [];
  const selectedPlayers = players?.filter(p => p.status !== "Available") || [];

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
            <p>Available Players: {availablePlayers.length}</p>
            <p>Selected Players: {selectedPlayers.length}</p>
          </div>
        </div>

        {/* Team Summary */}
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold">Team Summary</h3>
          <div className="space-y-2">
            {teams?.map((team) => (
              <div key={team.id} className="flex justify-between">
                <span>{team.name}</span>
                <span>Players: {selectedPlayers.filter(p => p.team_id === team.id).length}</span>
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
            {availablePlayers.map((player) => (
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

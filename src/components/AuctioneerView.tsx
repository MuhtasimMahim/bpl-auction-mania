import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DraftState, AuctioneerViewProps } from "@/types/auction";
import { Team } from "@/types/team";
import { Player } from "@/types/player";
import { DraftControls } from "./auctioneer/DraftControls";
import { StatusCard } from "./auctioneer/StatusCard";
import { TeamSummary } from "./auctioneer/TeamSummary";
import { PlayersTable } from "./auctioneer/PlayersTable";

export const AuctioneerView = ({ roomId }: AuctioneerViewProps) => {
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
    queryKey: ["room_players", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_players")
        .select("*, player:players(*)")
        .eq("room_id", roomId);
      if (error) throw error;
      return data.map(rp => rp.player) as Player[];
    },
  });

  // Subscribe to auction status changes
  useEffect(() => {
    const channel = supabase
      .channel('auction-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'room_auction_status' },
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
  const { data: auctionStatus } = useQuery({
    queryKey: ["room_auction_status", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_auction_status")
        .select("*")
        .eq("room_id", roomId)
        .single();
      
      if (error) {
        console.error("Error fetching auction status:", error);
        throw error;
      }

      if (data) {
        console.log('Initial auction status:', data);
        setDraftState(prev => ({
          ...prev,
          status: data.status as DraftState['status'],
          currentTeamId: data.current_team_id,
        }));
      }
      return data;
    },
  });

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

    if (!auctionStatus?.id) {
      toast({
        title: "Error",
        description: "No auction status record found",
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
        .eq("id", auctionStatus.id);

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
    if (!auctionStatus?.id) {
      toast({
        title: "Error",
        description: "No auction status record found",
        variant: "destructive",
      });
      return;
    }

    const newStatus = draftState.status === "paused" ? "in_progress" : "paused";
    
    const { error } = await supabase
      .from("auction_status")
      .update({
        status: newStatus,
      })
      .eq("id", auctionStatus.id);

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
    if (!auctionStatus?.id) {
      toast({
        title: "Error",
        description: "No auction status record found",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("auction_status")
      .update({
        status: "completed",
        current_team_id: null,
      })
      .eq("id", auctionStatus.id);

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
    if (!teams?.length || !auctionStatus?.id) {
      toast({
        title: "Error",
        description: "Missing required data to move to next team",
        variant: "destructive",
      });
      return;
    }

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
      .eq("id", auctionStatus.id);

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
        <DraftControls
          status={draftState.status}
          onStart={startDraft}
          onPause={pauseDraft}
          onNext={moveToNextTeam}
          onEnd={endDraft}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatusCard
          status={draftState.status}
          currentTeam={getCurrentTeam()}
          availablePlayersCount={availablePlayers.length}
          selectedPlayersCount={selectedPlayers.length}
        />
        <TeamSummary teams={teams || []} selectedPlayers={selectedPlayers} />
      </div>

      <PlayersTable players={availablePlayers} />
    </div>
  );
};

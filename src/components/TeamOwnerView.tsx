import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TeamOwnerViewProps } from "@/types/auction";
import { Team } from "@/types/team";
import { Player } from "@/types/player";
import { TeamSelection } from "./team-owner/TeamSelection";
import { PlayerSelectionTable } from "./team-owner/PlayerSelectionTable";
import { TeamActions } from "./team-owner/TeamActions";

export const TeamOwnerView = ({ roomId }: TeamOwnerViewProps) => {
  const { toast } = useToast();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: players, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ["room_players", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_players")
        .select("*, player:players(*)")
        .eq("room_id", roomId)
        .eq("status", "Available");
      
      if (error) throw error;
      return data.map(rp => rp.player);
    },
    enabled: !!selectedTeamId && !!roomId,
  });

  const { data: auctionStatus } = useQuery({
    queryKey: ["room_auction_status", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_auction_status")
        .select("*")
        .eq("room_id", roomId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTeamId && !!roomId,
  });

  useEffect(() => {
    if (!selectedTeamId) return;

    const channel = supabase
      .channel('auction-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'auction_status' },
        (payload) => {
          if (payload.new.current_team_id) {
            toast({
              title: "Turn Update",
              description: `It's ${payload.new.current_team_id === selectedTeamId ? 'your' : 'another team\'s'} turn`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTeamId, toast]);

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
    toast({
      title: "Team Selected",
      description: `You are now managing ${teams?.find(team => team.id === teamId)?.name}`,
    });
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  const handleSubmitSelection = async () => {
    if (!selectedPlayerId || !selectedTeamId || !auctionStatus?.id) {
      toast({
        title: "Error",
        description: "Please select a player first",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("players")
        .update({ 
          status: "Pending",
          team_id: selectedTeamId 
        })
        .eq("id", selectedPlayerId);

      if (error) throw error;

      toast({
        title: "Selection Submitted",
        description: "Waiting for auctioneer confirmation",
      });
      
      setSelectedPlayerId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit player selection",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePassTurn = async () => {
    if (!auctionStatus?.id) {
      toast({
        title: "Error",
        description: "No auction status found",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("auction_status")
        .update({ 
          current_team_id: null,
          status: "in_progress" 
        })
        .eq("id", auctionStatus.id);

      if (error) throw error;

      toast({
        title: "Turn Passed",
        description: "Your turn has been passed to the next team",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pass turn",
        variant: "destructive",
      });
    }
  };

  if (isLoadingTeams) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Loading teams...</h2>
      </div>
    );
  }

  if (!selectedTeamId) {
    return <TeamSelection teams={teams || []} onTeamSelect={handleTeamSelect} />;
  }

  const isMyTurn = auctionStatus?.current_team_id === selectedTeamId;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Available Players</h2>
        <TeamActions
          onSubmitSelection={handleSubmitSelection}
          onPassTurn={handlePassTurn}
          isSubmitting={isSubmitting}
          isMyTurn={isMyTurn}
          selectedPlayerId={selectedPlayerId}
        />
      </div>

      {!isMyTurn && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-800">
            Waiting for your turn... Current team:{" "}
            {teams?.find((team) => team.id === auctionStatus?.current_team_id)
              ?.name}
          </p>
        </div>
      )}

      <PlayerSelectionTable
        players={players || []}
        selectedPlayerId={selectedPlayerId}
        onPlayerSelect={handlePlayerSelect}
        isMyTurn={isMyTurn}
      />
    </div>
  );
};

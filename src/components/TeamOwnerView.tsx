import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { supabase } from "@/integrations/supabase/client";
import { Player, Team } from "@/types/auction";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const TeamOwnerView = () => {
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
      return data as Team[];
    },
  });

  const { data: players, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("status", "Available")
        .order("name");
      
      if (error) throw error;
      return data as Player[];
    },
    enabled: !!selectedTeamId,
  });

  const { data: auctionStatus } = useQuery({
    queryKey: ["auction_status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auction_status")
        .select("*")
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTeamId,
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
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Select Your Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams?.map((team) => (
            <Card 
              key={team.id}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleTeamSelect(team.id)}
            >
              <CardHeader>
                <CardTitle className="text-xl">{team.name}</CardTitle>
                <p className="text-sm text-gray-500">Budget: ${team.budget.toLocaleString()}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const isMyTurn = auctionStatus?.current_team_id === selectedTeamId;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Available Players</h2>
        <div className="space-x-4">
          <Button
            onClick={handleSubmitSelection}
            disabled={!selectedPlayerId || isSubmitting || !isMyTurn}
          >
            {isSubmitting ? "Submitting..." : "Submit Selection"}
          </Button>
          <Button
            variant="outline"
            onClick={handlePassTurn}
            disabled={!isMyTurn}
          >
            Pass Turn
          </Button>
        </div>
      </div>

      {!isMyTurn && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-800">
            Waiting for your turn... Current team: {teams?.find(team => team.id === auctionStatus?.current_team_id)?.name}
          </p>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Select</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players?.map((player) => (
            <TableRow key={player.id}>
              <TableCell>
                <RadioGroup
                  value={selectedPlayerId || ""}
                  onValueChange={handlePlayerSelect}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={player.id}
                      id={`player-${player.id}`}
                      disabled={!isMyTurn || player.status !== "Available"}
                    />
                  </div>
                </RadioGroup>
              </TableCell>
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
  );
};
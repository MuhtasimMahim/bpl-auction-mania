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
import { Label } from "@/components/ui/label";

export const TeamOwnerView = () => {
  const { toast } = useToast();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

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
  });

  useEffect(() => {
    const channel = supabase
      .channel('auction-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'auction_status' },
        (payload) => {
          setCurrentTeamId(payload.new.current_team_id);
          if (payload.new.current_team_id) {
            toast({
              title: "Turn Update",
              description: `It's ${payload.new.current_team_id === currentTeamId ? 'your' : 'another team\'s'} turn`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTeamId, toast]);

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  const handleSubmitSelection = async () => {
    if (!selectedPlayerId) {
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
        .update({ status: "Pending" })
        .eq("id", selectedPlayerId);

      if (error) throw error;

      toast({
        title: "Selection Submitted",
        description: "Waiting for auctioneer confirmation",
      });
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
    try {
      const { error } = await supabase
        .from("auction_status")
        .update({ status: "in_progress" })
        .eq("id", auctionStatus?.id);

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

  if (isLoadingPlayers) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Loading players...</h2>
      </div>
    );
  }

  const isMyTurn = currentTeamId === "your-team-id"; // Replace with actual team ID logic

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
            Waiting for your turn... Current team: {currentTeamId}
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
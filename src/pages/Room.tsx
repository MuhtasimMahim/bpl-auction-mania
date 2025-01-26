import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { RoleSelection } from "@/components/RoleSelection";
import { TeamOwnerView } from "@/components/TeamOwnerView";
import { AuctioneerView } from "@/components/AuctioneerView";
import { UserRole } from "@/types/auction";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RoomProps {
  roomId?: string;
}

const Room = () => {
  const { roomId } = useParams();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { toast } = useToast();

  const { data: room, isLoading } = useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    toast({
      title: "Role Selected",
      description: `You are now viewing as ${role}`,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!room) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen">
      {!selectedRole ? (
        <RoleSelection onRoleSelect={handleRoleSelect} />
      ) : selectedRole === "Team Owner" ? (
        <TeamOwnerView roomId={roomId!} />
      ) : selectedRole === "Auctioneer" ? (
        <AuctioneerView roomId={roomId!} />
      ) : (
        <div className="p-6">
          <h2 className="text-2xl font-bold">
            {selectedRole} view is under construction
          </h2>
        </div>
      )}
    </div>
  );
};

export default Room;
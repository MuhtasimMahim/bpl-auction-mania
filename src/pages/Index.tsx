import { useState } from "react";
import { RoleSelection } from "@/components/RoleSelection";
import { TeamOwnerView } from "@/components/TeamOwnerView";
import { AuctioneerView } from "@/components/AuctioneerView";
import { UserRole } from "@/types/auction";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { toast } = useToast();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    toast({
      title: "Role Selected",
      description: `You are now viewing as ${role}`,
    });
  };

  return (
    <div className="min-h-screen">
      {!selectedRole ? (
        <RoleSelection onRoleSelect={handleRoleSelect} />
      ) : selectedRole === "Team Owner" ? (
        <TeamOwnerView />
      ) : selectedRole === "Auctioneer" ? (
        <AuctioneerView />
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

export default Index;
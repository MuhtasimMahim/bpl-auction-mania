import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/auction";

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
}

export const RoleSelection = ({ onRoleSelect }: RoleSelectionProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-4">
      <div className="max-w-4xl w-full animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-8">
          BPL Players Auction
        </h1>
        <div className="grid md:grid-cols-3 gap-6">
          {["Auctioneer", "Team Owner", "Viewer"].map((role) => (
            <Card key={role} className="p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-4">{role}</h2>
              <p className="text-gray-600 mb-6">
                {role === "Auctioneer"
                  ? "Control and manage the auction process"
                  : role === "Team Owner"
                  ? "Bid on players and manage your team"
                  : "Watch the auction in real-time"}
              </p>
              <Button
                className="w-full"
                onClick={() => onRoleSelect(role as UserRole)}
              >
                Enter as {role}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const RoomList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomPassword, setNewRoomPassword] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const { data: rooms, refetch } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleCreateRoom = async () => {
    if (!newRoomName || !newRoomPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("rooms")
        .insert([
          {
            name: newRoomName,
            password: newRoomPassword,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Room created successfully",
      });

      refetch();
      setNewRoomName("");
      setNewRoomPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    }
  };

  const handleJoinRoom = async () => {
    if (!selectedRoomId || !joinPassword) {
      toast({
        title: "Error",
        description: "Please enter the password",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", selectedRoomId)
        .eq("password", joinPassword)
        .single();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Invalid password",
          variant: "destructive",
        });
        return;
      }

      navigate(`/room/${selectedRoomId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join room",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white text-center">
          BPL Auction Rooms
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Room Section */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                Create New Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roomName">Room Name</Label>
                  <Input
                    id="roomName"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Enter room name"
                  />
                </div>
                <div>
                  <Label htmlFor="roomPassword">Password</Label>
                  <Input
                    id="roomPassword"
                    type="password"
                    value={newRoomPassword}
                    onChange={(e) => setNewRoomPassword(e.target.value)}
                    placeholder="Enter room password"
                  />
                </div>
                <Button onClick={handleCreateRoom} className="w-full">
                  Create Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Available Rooms */}
          <div className="bg-white rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Available Rooms</h2>
            <div className="space-y-4">
              {rooms?.map((room) => (
                <Dialog key={room.id}>
                  <DialogTrigger asChild>
                    <div
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedRoomId(room.id)}
                    >
                      <h3 className="font-semibold">{room.name}</h3>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(room.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join Room: {room.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={joinPassword}
                          onChange={(e) => setJoinPassword(e.target.value)}
                          placeholder="Enter room password"
                        />
                      </div>
                      <Button onClick={handleJoinRoom} className="w-full">
                        Join Room
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
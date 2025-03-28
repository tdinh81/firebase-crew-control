
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, UserPlus, Users, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Player {
  uid: string;
  displayName: string;
  email: string;
  isActive: boolean;
  createdAt?: any;
}

const ManagePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const navItems = [
    { href: "/agent", icon: <Home className="h-5 w-5" />, title: "Dashboard" },
    { href: "/create-player", icon: <UserPlus className="h-5 w-5" />, title: "Create Player" },
    { href: "/manage-players", icon: <Users className="h-5 w-5" />, title: "Manage Players" },
  ];

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!userData) return;

      try {
        setIsLoading(true);
        const playersQuery = query(
          collection(db, "users"),
          where("role", "==", "player"),
          where("createdBy", "==", userData.uid)
        );
        
        const querySnapshot = await getDocs(playersQuery);
        const playersList = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as Player));
        
        setPlayers(playersList);
        setFilteredPlayers(playersList);
      } catch (error) {
        console.error("Error fetching players:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load players",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, [userData, toast]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = players.filter(player =>
        player.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlayers(filtered);
    } else {
      setFilteredPlayers(players);
    }
  }, [searchTerm, players]);

  const togglePlayerStatus = async (player: Player) => {
    try {
      const playerRef = doc(db, "users", player.uid);
      await updateDoc(playerRef, {
        isActive: !player.isActive
      });
      
      // Update local state
      setPlayers(players.map(p => 
        p.uid === player.uid ? { ...p, isActive: !p.isActive } : p
      ));
      
      toast({
        title: "Player Updated",
        description: `${player.displayName} is now ${!player.isActive ? 'active' : 'inactive'}`,
      });
    } catch (error) {
      console.error("Error updating player status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update player status",
      });
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manage Players</h1>
            <p className="text-gray-500">View and manage all players in your system</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search players..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => navigate("/create-player")}>
              <UserPlus className="h-4 w-4 mr-2" />
              New Player
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Players</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading players...</div>
            ) : filteredPlayers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Name</th>
                      <th className="text-left py-3 px-2">Email</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-right py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player) => (
                      <tr key={player.uid} className="border-b">
                        <td className="py-3 px-2">{player.displayName}</td>
                        <td className="py-3 px-2">{player.email}</td>
                        <td className="py-3 px-2">
                          <Badge variant={player.isActive ? "success" : "destructive"}>
                            {player.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePlayerStatus(player)}
                          >
                            {player.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                {searchTerm ? "No players found matching your search" : "No players created yet"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagePlayers;

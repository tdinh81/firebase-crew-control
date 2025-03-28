
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, UserPlus, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AgentDashboard = () => {
  const [playerCount, setPlayerCount] = useState(0);
  const [activePlayerCount, setActivePlayerCount] = useState(0);
  const [recentPlayers, setRecentPlayers] = useState<DocumentData[]>([]);
  const { userData } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { href: "/agent", icon: <Home className="h-5 w-5" />, title: "Dashboard" },
    { href: "/create-player", icon: <UserPlus className="h-5 w-5" />, title: "Create Player" },
    { href: "/manage-players", icon: <Users className="h-5 w-5" />, title: "Manage Players" },
  ];

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!userData) return;

      try {
        // Query for all players created by the current agent
        const playersQuery = query(
          collection(db, "users"),
          where("role", "==", "player"),
          where("createdBy", "==", userData.uid)
        );
        
        const querySnapshot = await getDocs(playersQuery);
        const players = querySnapshot.docs.map(doc => doc.data());
        
        setPlayerCount(players.length);
        setActivePlayerCount(players.filter(player => player.isActive).length);
        
        // Get the 5 most recently created players
        const sortedPlayers = [...players].sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.seconds - a.createdAt.seconds;
          }
          return 0;
        }).slice(0, 5);
        
        setRecentPlayers(sortedPlayers);
      } catch (error) {
        console.error("Error fetching player data:", error);
      }
    };

    fetchPlayerData();
  }, [userData]);

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Agent Dashboard</h1>
          <p className="text-gray-500">Welcome back, {userData?.displayName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePlayerCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Inactive Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerCount - activePlayerCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Players</CardTitle>
              <CardDescription>Recently created players in your system</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPlayers.length > 0 ? (
                <div className="space-y-4">
                  {recentPlayers.map((player, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{player.displayName}</p>
                        <p className="text-sm text-gray-500">{player.email}</p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${player.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {player.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No players created yet
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate("/manage-players")}>
                View All Players
              </Button>
            </CardFooter>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" onClick={() => navigate("/create-player")}>
                <UserPlus className="mr-2 h-4 w-4" />
                Create New Player
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/manage-players")}>
                <Users className="mr-2 h-4 w-4" />
                Manage Existing Players
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;

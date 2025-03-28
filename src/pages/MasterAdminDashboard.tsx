
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, UserPlus, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const MasterAdminDashboard = () => {
  const [agentCount, setAgentCount] = useState(0);
  const [activeAgentCount, setActiveAgentCount] = useState(0);
  const [recentAgents, setRecentAgents] = useState<DocumentData[]>([]);
  const { userData } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { href: "/master-admin", icon: <Home className="h-5 w-5" />, title: "Dashboard" },
    { href: "/create-agent", icon: <UserPlus className="h-5 w-5" />, title: "Create Agent" },
    { href: "/manage-agents", icon: <Users className="h-5 w-5" />, title: "Manage Agents" },
  ];

  useEffect(() => {
    const fetchAgentData = async () => {
      if (!userData) return;

      try {
        // Query for all agents created by the current master admin
        const agentsQuery = query(
          collection(db, "users"),
          where("role", "==", "agent"),
          where("createdBy", "==", userData.uid)
        );
        
        const querySnapshot = await getDocs(agentsQuery);
        const agents = querySnapshot.docs.map(doc => doc.data());
        
        setAgentCount(agents.length);
        setActiveAgentCount(agents.filter(agent => agent.isActive).length);
        
        // Get the 5 most recently created agents
        const sortedAgents = [...agents].sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.seconds - a.createdAt.seconds;
          }
          return 0;
        }).slice(0, 5);
        
        setRecentAgents(sortedAgents);
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
    };

    fetchAgentData();
  }, [userData]);

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Master Admin Dashboard</h1>
          <p className="text-gray-500">Welcome back, {userData?.displayName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAgentCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Inactive Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentCount - activeAgentCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Agents</CardTitle>
              <CardDescription>Recently created agents in your system</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAgents.length > 0 ? (
                <div className="space-y-4">
                  {recentAgents.map((agent, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{agent.displayName}</p>
                        <p className="text-sm text-gray-500">{agent.email}</p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${agent.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {agent.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No agents created yet
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate("/manage-agents")}>
                View All Agents
              </Button>
            </CardFooter>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" onClick={() => navigate("/create-agent")}>
                <UserPlus className="mr-2 h-4 w-4" />
                Create New Agent
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/manage-agents")}>
                <Users className="mr-2 h-4 w-4" />
                Manage Existing Agents
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

export default MasterAdminDashboard;

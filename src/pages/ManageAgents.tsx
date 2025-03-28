
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

interface Agent {
  uid: string;
  displayName: string;
  email: string;
  isActive: boolean;
  createdAt?: any;
}

const ManageAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const navItems = [
    { href: "/master-admin", icon: <Home className="h-5 w-5" />, title: "Dashboard" },
    { href: "/create-agent", icon: <UserPlus className="h-5 w-5" />, title: "Create Agent" },
    { href: "/manage-agents", icon: <Users className="h-5 w-5" />, title: "Manage Agents" },
  ];

  useEffect(() => {
    const fetchAgents = async () => {
      if (!userData) return;

      try {
        setIsLoading(true);
        const agentsQuery = query(
          collection(db, "users"),
          where("role", "==", "agent"),
          where("createdBy", "==", userData.uid)
        );
        
        const querySnapshot = await getDocs(agentsQuery);
        const agentsList = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as Agent));
        
        setAgents(agentsList);
        setFilteredAgents(agentsList);
      } catch (error) {
        console.error("Error fetching agents:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load agents",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [userData, toast]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = agents.filter(agent =>
        agent.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAgents(filtered);
    } else {
      setFilteredAgents(agents);
    }
  }, [searchTerm, agents]);

  const toggleAgentStatus = async (agent: Agent) => {
    try {
      const agentRef = doc(db, "users", agent.uid);
      await updateDoc(agentRef, {
        isActive: !agent.isActive
      });
      
      // Update local state
      setAgents(agents.map(a => 
        a.uid === agent.uid ? { ...a, isActive: !a.isActive } : a
      ));
      
      toast({
        title: "Agent Updated",
        description: `${agent.displayName} is now ${!agent.isActive ? 'active' : 'inactive'}`,
      });
    } catch (error) {
      console.error("Error updating agent status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update agent status",
      });
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manage Agents</h1>
            <p className="text-gray-500">View and manage all agents in your system</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search agents..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => navigate("/create-agent")}>
              <UserPlus className="h-4 w-4 mr-2" />
              New Agent
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agents</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading agents...</div>
            ) : filteredAgents.length > 0 ? (
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
                    {filteredAgents.map((agent) => (
                      <tr key={agent.uid} className="border-b">
                        <td className="py-3 px-2">{agent.displayName}</td>
                        <td className="py-3 px-2">{agent.email}</td>
                        <td className="py-3 px-2">
                          <Badge variant={agent.isActive ? "success" : "destructive"}>
                            {agent.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAgentStatus(agent)}
                          >
                            {agent.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                {searchTerm ? "No agents found matching your search" : "No agents created yet"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManageAgents;

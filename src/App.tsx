
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MasterAdminDashboard from "./pages/MasterAdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import CreateAgent from "./pages/CreateAgent";
import ManageAgents from "./pages/ManageAgents";
import CreatePlayer from "./pages/CreatePlayer";
import ManagePlayers from "./pages/ManagePlayers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ element, allowedRoles }: ProtectedRouteProps) => {
  const { currentUser, userData, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!currentUser || !userData || !userData.role || !allowedRoles.includes(userData.role)) {
    return <Navigate to="/login" />;
  }
  
  return <>{element}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Master Admin Routes */}
            <Route 
              path="/master-admin" 
              element={<ProtectedRoute element={<MasterAdminDashboard />} allowedRoles={["masterAdmin"]} />} 
            />
            <Route 
              path="/create-agent" 
              element={<ProtectedRoute element={<CreateAgent />} allowedRoles={["masterAdmin"]} />} 
            />
            <Route 
              path="/manage-agents" 
              element={<ProtectedRoute element={<ManageAgents />} allowedRoles={["masterAdmin"]} />} 
            />
            
            {/* Agent Routes */}
            <Route 
              path="/agent" 
              element={<ProtectedRoute element={<AgentDashboard />} allowedRoles={["agent"]} />} 
            />
            <Route 
              path="/create-player" 
              element={<ProtectedRoute element={<CreatePlayer />} allowedRoles={["agent"]} />} 
            />
            <Route 
              path="/manage-players" 
              element={<ProtectedRoute element={<ManagePlayers />} allowedRoles={["agent"]} />} 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

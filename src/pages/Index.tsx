
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && userData) {
      // Redirect based on role
      if (userData.role === "masterAdmin") {
        navigate("/master-admin");
      } else if (userData.role === "agent") {
        navigate("/agent");
      }
    }
  }, [currentUser, userData, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-gray-900">Firebase Crew Control System</h1>
        <p className="text-xl mb-8 text-gray-700">
          Manage your crew hierarchy with our powerful dashboard system.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentUser ? (
            <Button onClick={() => navigate(userData?.role === "masterAdmin" ? "/master-admin" : "/agent")}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button variant="outline" onClick={() => navigate("/register")}>
                Register Master Admin
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-3 text-blue-800">Master Admin</h2>
          <p className="text-gray-600">Create and manage agents with full control over the system.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-3 text-blue-800">Agents</h2>
          <p className="text-gray-600">Manage players and track their activities efficiently.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-3 text-blue-800">Players</h2>
          <p className="text-gray-600">End users managed by agents within the system.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;

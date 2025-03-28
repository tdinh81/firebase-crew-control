
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

type UserRole = "masterAdmin" | "agent" | "player" | null;

interface UserData {
  uid: string;
  username: string;
  displayName: string | null;
  role: UserRole;
  isActive: boolean;
  createdBy?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string, role: UserRole, createdBy?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  async function getUserData(user: User) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const data = await getUserData(user);
        setUserData(data);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function register(username: string, password: string, name: string, role: UserRole, createdBy?: string) {
    try {
      setLoading(true);
      // For Firebase auth, we'll create an email using the username
      // This is necessary because Firebase requires email format
      const email = `${username}@crewcontrol.com`;
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: name
      });

      // Create user document in Firestore
      const userData: UserData = {
        uid: user.uid,
        username: username,
        displayName: name,
        role: role,
        isActive: true,
        createdBy: createdBy
      };

      await setDoc(doc(db, "users", user.uid), userData);
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully",
      });
      
      return;
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function login(username: string, password: string) {
    try {
      setLoading(true);
      // Convert username to email format for Firebase auth
      const email = `${username}@crewcontrol.com`;
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      setLoading(true);
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  const value = {
    currentUser,
    userData,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div className="flex items-center justify-center h-screen">Loading...</div>}
    </AuthContext.Provider>
  );
}

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  email: string;
  name: string | undefined;
  currentLevel: number;
  totalExercises: number;
  averageScore: number;
  lastActive: number;
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const registerUser = useMutation(api.auth.registerUser);
  const loginUser = useMutation(api.auth.loginUser);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("phraser_user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch {
        localStorage.removeItem("phraser_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await loginUser({ email, password });
      setUser(userData);
      localStorage.setItem("phraser_user", JSON.stringify(userData));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      const userId = await registerUser({ email, name, password });
      const userData: User = {
        _id: userId,
        email,
        name,
        currentLevel: 1000,
        totalExercises: 0,
        averageScore: 0,
        lastActive: Date.now(),
        createdAt: Date.now(),
      };
      setUser(userData);
      localStorage.setItem("phraser_user", JSON.stringify(userData));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("phraser_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 
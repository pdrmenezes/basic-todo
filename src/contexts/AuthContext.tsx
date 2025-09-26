import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/clerk-react";
import { userService } from "../db/services";
import type { AuthUser } from "../types";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    if (!isLoaded || !clerkUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let dbUser = await userService.findByClerkId(clerkUser.id);

      if (!dbUser) {
        const createResult = await userService.create({
          clerkId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          imageUrl: clerkUser.imageUrl || null,
        });
        if (createResult.success && createResult.data) {
          dbUser = createResult.data;
          console.log("Created new user in database");
        }
      } else {
        const needsUpdate =
          dbUser.email !==
            (clerkUser.primaryEmailAddress?.emailAddress || "") ||
          dbUser.firstName !== (clerkUser.firstName || null) ||
          dbUser.lastName !== (clerkUser.lastName || null) ||
          dbUser.imageUrl !== (clerkUser.imageUrl || null);

        if (needsUpdate) {
          const updateResult = await userService.update(dbUser.id, {
            email: clerkUser.primaryEmailAddress?.emailAddress || "",
            firstName: clerkUser.firstName || null,
            lastName: clerkUser.lastName || null,
            imageUrl: clerkUser.imageUrl || null,
          });
          if (updateResult.success && updateResult.data) {
            dbUser = updateResult.data;
            console.log("Updated user in database");
          }
        }
      }

      setUser(dbUser);
    } catch (err) {
      console.error("Error refreshing user:", err);
      setError("Failed to sync user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [clerkUser, isLoaded]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import React, { createContext, useContext, useState, useCallback } from "react";
import { authClient } from "~/lib/auth.client";
import type { User, CreateUserData, UpdateUserData } from "~/types";

interface UserContextType {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (data: CreateUserData) => Promise<void>;
  updateUser: (userId: string, data: UpdateUserData) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authClient.admin.listUsers({
        query: {
          limit: 100,
          offset: 0,
        },
      });
      
      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch users");
      }

      if (result.data) {
        setUsers(result.data.users as User[]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMessage);
      console.error("Fetch users error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: CreateUserData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authClient.admin.createUser({
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to create user");
      }

      // Optimistic update: add the new user to the list
      if (result.data) {
        setUsers((prevUsers) => [...prevUsers, result.data.user as User]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create user";
      setError(errorMessage);
      console.error("Create user error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: string, data: UpdateUserData) => {
    setIsLoading(true);
    setError(null);
    
    // Optimistic update: update the user in the list immediately
    const previousUsers = [...users];
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, ...data } : user
      )
    );

    try {
      const result = await authClient.admin.updateUser({
        userId,
        data,
      });

      if (result.error) {
        // Revert optimistic update on error
        setUsers(previousUsers);
        throw new Error(result.error.message || "Failed to update user");
      }

      // Update with actual data from server
      if (result.data) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? (result.data as User) : user
          )
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user";
      setError(errorMessage);
      console.error("Update user error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [users]);

  const deleteUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    // Optimistic update: remove the user from the list immediately
    const previousUsers = [...users];
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

    try {
      const result = await authClient.admin.removeUser({
        userId,
      });

      if (result.error) {
        // Revert optimistic update on error
        setUsers(previousUsers);
        throw new Error(result.error.message || "Failed to delete user");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete user";
      setError(errorMessage);
      console.error("Delete user error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [users]);

  const value: UserContextType = {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}

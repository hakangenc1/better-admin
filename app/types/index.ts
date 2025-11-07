// Type definitions for the application

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean;
  banReason?: string;
  banUntil?: Date;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: "user" | "admin";
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: "user" | "admin";
  emailVerified?: boolean;
}

export interface ListUsersResponse {
  data: User[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

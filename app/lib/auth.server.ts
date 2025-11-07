import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";

// Initialize SQLite database
const db = new Database(process.env.DATABASE_URL || "./data/auth.db");

export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  trustedOrigins: ["http://localhost:5173"],
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      async isAdmin(user: { role: string }) {
        return user.role === "admin";
      },
    }),
  ],
})

export type Session = typeof auth.$Infer.Session;

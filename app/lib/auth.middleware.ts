import { redirect } from "react-router";
import { auth } from "~/lib/auth.server";

/**
 * Authentication middleware for protected routes
 * Checks if the user is authenticated
 * 
 * @param request - The incoming request object
 * @returns The authenticated user object
 * @throws Redirects to login page if not authenticated
 */
export async function requireAuth(request: Request) {
  // Get the current session from Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Check if user is authenticated
  if (!session?.user) {
    throw redirect("/");
  }

  // Return user data to be available in the route context
  return session.user;
}

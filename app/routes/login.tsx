import { redirect } from "react-router";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/login";
import { auth } from "~/lib/auth.server";
import { LoginForm } from "~/components/auth/LoginForm";
import { useAuth } from "~/contexts/AuthContext";
import { ThemeToggle } from "~/components/ui/theme-toggle";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - User Management System" },
    { name: "description", content: "Login to access the user management dashboard" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // Check if user is already authenticated
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // If authenticated and admin, redirect to dashboard
  if (session?.user) {
    throw redirect("/dashboard");
  }

  return null;
}

export default function Login() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-foreground">
            User Management System
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Sign in to access the dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

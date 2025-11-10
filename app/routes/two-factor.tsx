import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle, Smartphone, ArrowLeft } from "lucide-react";
import { authClient } from "~/lib/auth.client";

export function meta() {
  return [
    { title: "Two-Factor Authentication - Better-Admin" },
    { name: "description", content: "Enter your 2FA code" },
  ];
}

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trustDevice, setTrustDevice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice,
      });

      if (result.error) {
        throw new Error(result.error.message || "Invalid code");
      }

      // Keep loading state active during redirect
      // Get the callback URL from search params or default to dashboard
      const callbackURL = searchParams.get("callbackURL") || "/dashboard";
      navigate(callbackURL);
      // Don't set isLoading to false - let the redirect happen with loading state active
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Invalid verification code");
      setCode("");
      inputRef.current?.focus();
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-1">Open your authenticator app</p>
                <p className="text-sm">
                  Find the 6-digit code for this account and enter it below. The code changes every 30 seconds.
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                ref={inputRef}
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setCode(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && code.length === 6) {
                    handleVerify(e);
                  }
                }}
                disabled={isLoading}
                className="text-center text-2xl tracking-widest font-mono"
                autoComplete="one-time-code"
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="trustDevice"
                checked={trustDevice}
                onCheckedChange={(checked) => setTrustDevice(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="trustDevice" className="text-sm font-normal cursor-pointer">
                Trust this device for 30 days
              </Label>
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleBackToLogin}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Lost access to your authenticator?
              </p>
              <p className="text-sm text-muted-foreground">
                Contact your administrator for help.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

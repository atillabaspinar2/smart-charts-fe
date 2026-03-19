import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  initialMode?: "signup" | "signin";
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  initialMode = "signup",
  onSuccess,
}) => {
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signup, signin } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await signup(fullName, email, password);
      } else {
        await signin(email, password);
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setError(null);
    setMode((m) => (m === "signup" ? "signin" : "signup"));
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-6 text-foreground">
        {mode === "signup" ? "Create account" : "Sign in"}
      </h2>

      <form
        key={mode}
        onSubmit={handleSubmit}
        className="space-y-4"
        autoComplete="on"
        method="post"
      >
        {mode === "signup" && (
          <div className="space-y-1">
            <Label htmlFor="fullName" className="block text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
            />
          </div>
        )}
        <div className="space-y-1">
          <Label htmlFor="email" className="block text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            name="username"
            autoComplete="username"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password" className="block text-sm font-medium">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            name="password"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {mode === "signup" && (
          <div className="space-y-1">
            <Label
              htmlFor="confirmPassword"
              className="block text-sm font-medium"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          variant="default"
          size="default"
          className="w-full"
          disabled={loading}
        >
          {loading
            ? mode === "signup"
              ? "Creating account…"
              : "Signing in…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {mode === "signup"
          ? "Already have an account?"
          : "Don't have an account?"}{" "}
        <button
          type="button"
          className="text-primary underline hover:text-primary/80"
          onClick={toggleMode}
        >
          {mode === "signup" ? "Sign in" : "Sign up"}
        </button>
      </p>
    </div>
  );
};

// Backwards-compatible alias
export const SignupForm = AuthForm;

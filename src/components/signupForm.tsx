import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { CustomButton } from "./UILibrary/CustomButton";
import { CustomInput } from "./UILibrary/customInput";

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
      <h2 className="text-xl font-bold mb-6 text-theme-text">
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
          <CustomInput
            id="fullName"
            label="Full Name"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength={2}
          />
        )}
        <CustomInput
          id="email"
          label="Email"
          type="email"
          name="username"
          autoComplete="username"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <CustomInput
          id="password"
          label="Password"
          type="password"
          name="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {mode === "signup" && (
          <CustomInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <CustomButton
          type="submit"
          variant="primary"
          size="md"
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
        </CustomButton>
      </form>

      <p className="mt-4 text-center text-sm text-theme-text">
        {mode === "signup"
          ? "Already have an account?"
          : "Don't have an account?"}{" "}
        <button
          type="button"
          className="text-theme-accent underline hover:text-theme-strong"
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

import { getApiBaseUrl } from "@/config/apiBaseUrl";

const API_URL = getApiBaseUrl();

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
}

interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
}

interface SigninPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = (await res
      .json()
      .catch(() => ({ message: "Request failed" }))) as { message?: string };
    throw new Error(body.message ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

export const authApi = {
  signup: (payload: SignupPayload): Promise<AuthResponse> =>
    apiFetch("/users/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  signin: (payload: SigninPayload): Promise<AuthResponse> =>
    apiFetch("/users/signin", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: (token: string): Promise<void> =>
    apiFetch("/users/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
};

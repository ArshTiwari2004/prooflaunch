import { cookies } from "next/headers";
import { API_URL, TOKEN_COOKIE } from "./config";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function hasSession(): boolean {
  return Boolean(cookies().get(TOKEN_COOKIE)?.value);
}

/** Server-side call to the Spring Boot API. Attaches the JWT from the httpOnly cookie when present. */
export async function apiFetch<T>(path: string, options: { auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.auth !== false) {
    const token = cookies().get(TOKEN_COOKIE)?.value;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api${path}`, { headers, cache: "no-store" });
  if (!res.ok) {
    throw new ApiError(res.status, await res.text().catch(() => ""));
  }
  return (await res.json()) as T;
}

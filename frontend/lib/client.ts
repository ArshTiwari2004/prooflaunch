/** Helpers for browser-side calls to the same-origin /bff proxy. */
export interface Problem {
  message: string;
  fieldErrors: Record<string, string>;
}

export async function readProblem(res: Response): Promise<Problem> {
  try {
    const body = (await res.json()) as { detail?: string; title?: string; errors?: Record<string, string> };
    return {
      message: (body.detail ?? body.title ?? "something went wrong, please try again").toLowerCase(),
      fieldErrors: body.errors ?? {},
    };
  } catch {
    return { message: "something went wrong, please try again", fieldErrors: {} };
  }
}

/** Only allow same-site relative redirects (prevents open-redirect via ?next=). */
export function safeNext(next: string | null | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) return next;
  return "/";
}

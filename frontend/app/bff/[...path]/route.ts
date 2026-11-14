import { NextRequest, NextResponse } from "next/server";
import { API_URL, TOKEN_COOKIE } from "@/lib/config";

/**
 * Backend-for-frontend proxy. The browser only ever talks to this same-origin route; the JWT lives in an
 * httpOnly cookie and is attached here, so it can never be read by JavaScript (XSS-safe) and no CORS is needed.
 */
async function forward(req: NextRequest, { params }: { params: { path: string[] } }) {
  const segments = params.path;
  if (segments[0] === "auth" || segments.some((s) => s === "." || s === "..")) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  const target = `${API_URL}/api/${segments.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;
  const headers = new Headers({ Accept: "application/json" });
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const xff = req.headers.get("x-forwarded-for");
  if (xff) headers.set("X-Forwarded-For", xff);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? await req.text() : undefined,
    cache: "no-store",
  });

  const text = await upstream.text();
  return new NextResponse(text.length > 0 ? text : null, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;

import { NextRequest, NextResponse } from "next/server";
import { API_URL, TOKEN_COOKIE } from "@/lib/config";
import type { UserView } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(TOKEN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  }
  if (params.action !== "login" && params.action !== "register") {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  const headers = new Headers({ "Content-Type": "application/json", Accept: "application/json" });
  const xff = req.headers.get("x-forwarded-for");
  if (xff) headers.set("X-Forwarded-For", xff);

  const upstream = await fetch(`${API_URL}/api/auth/${params.action}`, {
    method: "POST",
    headers,
    body: await req.text(),
    cache: "no-store",
  });
  const text = await upstream.text();

  if (!upstream.ok) {
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
  }

  const data = JSON.parse(text) as { token: string; user: UserView };
  const res = NextResponse.json({ user: data.user }, { status: upstream.status });
  res.cookies.set(TOKEN_COOKIE, data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: 60 * Number(process.env.SESSION_MINUTES ?? "120"),
  });
  return res;
}

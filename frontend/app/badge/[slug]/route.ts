import { NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

/** same-origin proxy for the embeddable proof badge (svg), cached for five minutes. */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const upstream = await fetch(`${API_URL}/api/products/${encodeURIComponent(params.slug)}/badge.svg`, { cache: "no-store" });
  if (!upstream.ok) {
    return new NextResponse("not found", { status: 404 });
  }
  return new NextResponse(await upstream.text(), {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300",
    },
  });
}

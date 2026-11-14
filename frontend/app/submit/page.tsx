import { redirect } from "next/navigation";
import SubmitForm from "@/components/SubmitForm";
import { apiFetch, hasSession } from "@/lib/api";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "launch a product", robots: { index: false } };

export default async function SubmitPage() {
  if (!hasSession()) redirect("/login?next=/submit");
  const categories = await apiFetch<Category[]>("/categories", { auth: false });
  return <SubmitForm categories={categories} />;
}

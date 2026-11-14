import { notFound, redirect } from "next/navigation";
import SubmitForm from "@/components/SubmitForm";
import { ApiError, apiFetch, hasSession } from "@/lib/api";
import type { Category, ProductDetail, ViewerState } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "edit product", robots: { index: false } };

export default async function EditPage({ params }: { params: { slug: string } }) {
  if (!hasSession()) redirect(`/login?next=${encodeURIComponent(`/products/${params.slug}/edit`)}`);

  let detail: ProductDetail;
  try {
    detail = await apiFetch<ProductDetail>(`/products/${encodeURIComponent(params.slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const [viewer, categories] = await Promise.all([
    apiFetch<ViewerState>(`/products/${detail.product.id}/viewer`),
    apiFetch<Category[]>("/categories", { auth: false }),
  ]);
  if (!viewer.owner) redirect(`/products/${params.slug}`);

  const category = categories.find((c) => c.slug === detail.product.categorySlug);
  return (
    <SubmitForm
      categories={categories}
      product={{
        id: detail.product.id,
        name: detail.product.name,
        tagline: detail.product.tagline,
        description: detail.description ?? "",
        websiteUrl: detail.websiteUrl,
        logoUrl: detail.product.logoUrl ?? "",
        categoryId: category?.id ?? categories[0].id,
      }}
    />
  );
}

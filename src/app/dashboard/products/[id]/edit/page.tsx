import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/store");

  const [product, categories, sellers] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, name: true, nomeLoja: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Voltar aos produtos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Editar produto</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ProductForm
          product={{
            id: product.id,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            categoryId: product.categoryId,
            sellerId: product.sellerId,
            imageUrl: product.image ? `/api/products/${product.id}/image` : null,
            pdfUrl: product.pdf ? `/api/products/${product.id}/pdf` : null,
          }}
          categories={categories}
          sellers={sellers}
        />
      </div>
    </div>
  );
}

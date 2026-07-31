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

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  if (product.sellerId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Voltar aos meus produtos
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
            imageUrl: product.image ? `/api/products/${product.id}/image` : null,
          }}
        />
      </div>
    </div>
  );
}

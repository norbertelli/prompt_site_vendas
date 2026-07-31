import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/product-form";
import { DeleteProductButton } from "@/components/delete-product-button";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const products = await prisma.product.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <section>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Meus produtos</h1>
        <p className="text-sm text-slate-600">
          Cadastre e gerencie os produtos do seu catálogo.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Cadastrar novo produto
            </h2>
            <ProductForm />
          </div>
        </div>

        <div className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Seu catálogo ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              Nenhum produto cadastrado ainda. Use o formulário ao lado.
            </div>
          ) : (
            <ul className="space-y-3">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/products/${product.id}/image`}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        sem foto
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-600">{formatBRL(product.price)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Editar
                    </Link>
                    <DeleteProductButton productId={product.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

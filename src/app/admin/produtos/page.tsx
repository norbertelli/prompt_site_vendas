import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/product-form";
import { DeleteProductButton } from "@/components/delete-product-button";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories, sellers] = await Promise.all([
    prisma.product.findMany({
      include: {
        seller: { select: { name: true, nomeLoja: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.seller.findMany({
      select: { id: true, name: true, nomeLoja: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Produtos ({products.length})
        </h1>
        <p className="text-sm text-slate-600">
          Cadastre e gerencie os produtos da loja.
        </p>
      </section>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-900">
              Cadastrar novo produto
            </h2>
            {categories.length === 0 ? (
              <p className="text-sm text-slate-500">
                Crie uma categoria em{" "}
                <Link href="/admin/categorias" className="text-blue-600 hover:underline">
                  Categorias
                </Link>{" "}
                antes de cadastrar produtos.
              </p>
            ) : (
              <ProductForm categories={categories} sellers={sellers} />
            )}
          </section>
        </div>

        <div className="lg:col-span-3">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Todos os produtos
            </h2>
            {products.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                Nenhum produto cadastrado.
              </p>
            ) : (
              <ul className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
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
                      <p className="text-sm text-slate-600">
                        {product.category.name} ·{" "}
                        {product.seller.nomeLoja || product.seller.name} ·{" "}
                        {formatBRL(Number(product.price))}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        title="Editar"
                        aria-label="Editar"
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-blue-600 transition hover:bg-blue-50"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

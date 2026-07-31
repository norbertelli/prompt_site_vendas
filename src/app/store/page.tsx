import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const seller = typeof sp.seller === "string" ? sp.seller.trim() : "";
  const min = typeof sp.min === "string" ? sp.min.trim() : "";
  const max = typeof sp.max === "string" ? sp.max.trim() : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "recent";

  const minNum = Number(min);
  const maxNum = Number(max);

  const where: Prisma.ProductWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  const priceFilter: { gte?: number; lte?: number } = {};
  if (Number.isFinite(minNum) && minNum > 0) {
    priceFilter.gte = minNum;
  }
  if (Number.isFinite(maxNum) && maxNum > 0) {
    priceFilter.lte = maxNum;
  }
  if (priceFilter.gte || priceFilter.lte) {
    where.price = priceFilter;
  }
  if (seller) {
    where.seller = { name: { contains: seller, mode: "insensitive" } };
  }

  const products = await prisma.product.findMany({
    where,
    include: { seller: { select: { name: true } } },
    orderBy:
      sort === "cheap"
        ? { price: "asc" }
        : sort === "expensive"
          ? { price: "desc" }
          : { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loja</h1>
          <p className="text-sm text-slate-600">
            {products.length} produto(s) disponíveis
          </p>
        </div>
      </div>

      <form
        method="get"
        action="/store"
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar produto..."
            className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 md:col-span-2"
          />
          <input
            name="seller"
            defaultValue={seller}
            placeholder="Vendedor"
            className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
          />
          <input
            name="min"
            defaultValue={min}
            placeholder="Preço mín."
            type="number"
            step="0.01"
            min="0"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
          />
          <input
            name="max"
            defaultValue={max}
            placeholder="Preço máx."
            type="number"
            step="0.01"
            min="0"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
          />
          <select
            name="sort"
            defaultValue={sort}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
          >
            <option value="recent">Mais recentes</option>
            <option value="cheap">Menor preço</option>
            <option value="expensive">Maior preço</option>
          </select>
          <button
            type="submit"
            className="col-span-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 md:col-span-1"
          >
            Filtrar
          </button>
        </div>
      </form>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Nenhum produto encontrado com esses filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                description: product.description,
                price: Number(product.price),
                hasImage: Boolean(product.image),
                sellerName: product.seller.name,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

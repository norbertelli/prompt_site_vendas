import Link from "next/link";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const category = typeof sp.category === "string" ? sp.category.trim() : "";
  const seller = typeof sp.seller === "string" ? sp.seller.trim() : "";
  const min = typeof sp.min === "string" ? sp.min.trim() : "";
  const max = typeof sp.max === "string" ? sp.max.trim() : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "recent";

  const minNum = Number(min);
  const maxNum = Number(max);

  const where: Prisma.ProductWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
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
    where.seller = {
      OR: [
        { name: { contains: seller } },
        { nomeLoja: { contains: seller } },
      ],
    };
  }
  if (category) {
    where.category = { name: category };
  }

  const [products, categories, sellers, purchasedItems] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: { select: { name: true, nomeLoja: true } },
        category: { select: { name: true } },
      },
      orderBy:
        sort === "cheap"
          ? { price: "asc" }
          : sort === "expensive"
            ? { price: "desc" }
            : { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.seller.findMany({
      select: { name: true, nomeLoja: true },
      orderBy: { name: "asc" },
    }),
    session?.user?.id
      ? prisma.orderItem.findMany({
          where: { order: { userId: session.user.id, status: "COMPLETED" } },
          select: { productId: true },
        })
      : Promise.resolve([]),
  ]);

  const purchasedProductIds = new Set(purchasedItems.map((i) => i.productId));

  const activeCategory = categories.find((c) => c.name === category);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-lg sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Bem-vindo à nossa loja
        </h1>
        <p className="mt-2 max-w-xl text-blue-100">
          Produtos organizados por categoria, livros em PDF e pagamento seguro
          via PayPal. Explore e adicione ao carrinho.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.slice(0, 5).map((c) => (
            <Link
              key={c.id}
              href={{ pathname: "/", query: { category: c.name } }}
              className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
            >
              {c.name}
            </Link>
          ))}
          {categories.length === 0 && (
            <span className="text-sm text-blue-100">
              Novas categorias em breve.
            </span>
          )}
        </div>
      </section>

      {activeCategory && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Categoria: {activeCategory.name}
          </h2>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Limpar filtro
          </Link>
        </div>
      )}

      <form
        method="get"
        action="/"
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar produto..."
            className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 md:col-span-2"
          />
          <select
            name="category"
            defaultValue={category}
            className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="seller"
            defaultValue={seller}
            className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
          >
            <option value="">Todas as lojas</option>
            {sellers.map((s) => (
              <option key={s.name + s.nomeLoja} value={s.nomeLoja || s.name}>
                {s.nomeLoja || s.name}
              </option>
            ))}
          </select>
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
                categoryName: product.category.name,
                sellerName: product.seller.nomeLoja || product.seller.name,
                hasPdf: Boolean(product.pdf),
                pdfUnlocked: purchasedProductIds.has(product.id),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

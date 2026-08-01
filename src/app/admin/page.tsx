import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeleteProductButton } from "@/components/delete-product-button";
import { ProductForm } from "@/components/product-form";
import { CategoryForm, CreateUserForm, SellerForm } from "@/components/admin-forms";
import { BuyerRow, CategoryRow, SellerRow, UserRow } from "@/components/admin-table";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

function Table({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty: string;
}) {
  return (
    <div className="max-h-96 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-slate-500">
          <tr>
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
          {empty && (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-slate-500">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const [categories, products, sellers, users, buyers, completedOrders, totalRevenue] =
    await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.product.findMany({
        include: {
          seller: { select: { name: true, nomeLoja: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.seller.findMany({
        select: {
          id: true,
          name: true,
          nomeLoja: true,
          email: true,
          createdAt: true,
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          nomeLoja: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { orders: { some: {} } },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        where: { status: "COMPLETED" },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { quantity: true, price: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { total: true },
      }),
    ]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Painel administrativo</h1>
        <p className="text-sm text-slate-600">
          Gerencie categorias, vendedores, usuários, compradores e vendas.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: "Categorias", value: categories.length },
          { label: "Produtos", value: products.length },
          { label: "Usuários", value: users.length },
          { label: "Vendas concluídas", value: completedOrders.length },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-4">
          <p className="text-sm text-slate-500">Receita total (pedidos concluídos)</p>
          <p className="text-2xl font-bold text-slate-900">
            {formatBRL(Number(totalRevenue._sum.total || 0))}
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Categorias ({categories.length})
        </h2>
        <Table headers={["ID", "Nome", "Ações"]} empty="Nenhuma categoria ainda.">
          {categories.map((cat) => (
            <CategoryRow key={cat.id} category={cat} />
          ))}
        </Table>
        <div className="mt-4">
          <CategoryForm />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Vendedores ({sellers.length})
        </h2>
        <Table
          headers={["ID", "Nome", "Loja", "Email", "Produtos", "Ações"]}
          empty="Nenhum vendedor ainda."
        >
          {sellers.map((seller) => (
            <SellerRow
              key={seller.id}
              seller={{
                id: seller.id,
                name: seller.name,
                nomeLoja: seller.nomeLoja,
                email: seller.email,
                products: seller._count.products,
              }}
            />
          ))}
        </Table>
        <div className="mt-4">
          <SellerForm />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Usuários ({users.length})
        </h2>
        <Table
          headers={["ID", "Nome", "Email", "Telefone", "Loja", "Papel", "Criado em", "Ações"]}
          empty="Nenhum usuário ainda."
        >
          {users.map((user) => (
            <UserRow key={user.id} user={user} currentUserId={session.user.id} />
          ))}
        </Table>
        <div className="mt-4">
          <CreateUserForm />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Compradores ({buyers.length})
        </h2>
        <Table
          headers={["ID", "Nome", "Email", "Telefone", "Pedidos", "Ações"]}
          empty="Nenhum comprador ainda (usuários com pedidos)."
        >
          {buyers.map((buyer) => (
            <BuyerRow
              key={buyer.id}
              buyer={{
                id: buyer.id,
                name: buyer.name,
                email: buyer.email,
                phone: buyer.phone,
                orders: buyer._count.orders,
              }}
            />
          ))}
        </Table>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Vendas concluídas ({completedOrders.length})
        </h2>
        <Table headers={["ID", "Comprador", "Itens", "Total", "Data"]} empty="Nenhuma venda ainda.">
          {completedOrders.map((order) => {
            const items = order.items.reduce((sum, it) => sum + it.quantity, 0);
            return (
              <tr key={order.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{order.id}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{order.user.name}</p>
                  <p className="text-xs text-slate-500">{order.user.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{items}</td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {formatBRL(Number(order.total))}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            );
          })}
        </Table>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Todos os produtos ({products.length})
        </h2>
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
              <DeleteProductButton productId={product.id} />
            </li>
          ))}
          {products.length === 0 && (
            <li className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              Nenhum produto cadastrado.
            </li>
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Cadastrar novo produto
        </h2>
        {categories.length === 0 ? (
          <p className="text-sm text-slate-500">
            Crie uma categoria antes de cadastrar produtos.
          </p>
        ) : (
          <ProductForm categories={categories} sellers={sellers} />
        )}
      </section>
    </div>
  );
}

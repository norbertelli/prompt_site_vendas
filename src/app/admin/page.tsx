import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [categories, products, sellers, users, buyers, completedOrders, totalRevenue] =
    await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.seller.count(),
      prisma.user.count(),
      prisma.user.count({ where: { orders: { some: {} } } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { total: true },
      }),
    ]);

  const stats = [
    { label: "Categorias", value: categories },
    { label: "Produtos", value: products },
    { label: "Vendedores", value: sellers },
    { label: "Usuários", value: users },
    { label: "Compradores", value: buyers },
    { label: "Vendas concluídas", value: completedOrders },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Painel administrativo</h1>
        <p className="text-sm text-slate-600">
          Selecione uma seção no menu ao lado para gerenciar os dados.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Receita total (pedidos concluídos)</p>
        <p className="text-2xl font-bold text-slate-900">
          {formatBRL(Number(totalRevenue._sum.total || 0))}
        </p>
      </section>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Table } from "@/components/table";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const completedOrders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { quantity: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Vendas concluídas ({completedOrders.length})
        </h1>
        <p className="text-sm text-slate-600">
          Histórico de pedidos concluídos.
        </p>
      </section>

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
    </div>
  );
}

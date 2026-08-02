import { prisma } from "@/lib/prisma";
import { Table } from "@/components/table";
import { BuyerRow } from "@/components/admin-table";

export const dynamic = "force-dynamic";

export default async function AdminBuyersPage() {
  const buyers = await prisma.user.findMany({
    where: { orders: { some: {} } },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Compradores ({buyers.length})
        </h1>
        <p className="text-sm text-slate-600">
          Usuários que já realizaram pedidos.
        </p>
      </section>

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
    </div>
  );
}

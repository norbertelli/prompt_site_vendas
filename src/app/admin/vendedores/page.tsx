import { prisma } from "@/lib/prisma";
import { Table } from "@/components/table";
import { SellerRow } from "@/components/admin-table";
import { SellerForm } from "@/components/admin-forms";

export const dynamic = "force-dynamic";

export default async function AdminSellersPage() {
  const sellers = await prisma.seller.findMany({
    select: {
      id: true,
      name: true,
      nomeLoja: true,
      email: true,
      createdAt: true,
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Vendedores ({sellers.length})
        </h1>
        <p className="text-sm text-slate-600">
          Gerencie os vendedores e suas lojas.
        </p>
      </section>

      <div>
        <SellerForm />
      </div>

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
    </div>
  );
}

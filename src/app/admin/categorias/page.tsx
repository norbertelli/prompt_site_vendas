import { prisma } from "@/lib/prisma";
import { Table } from "@/components/table";
import { CategoryRow } from "@/components/admin-table";
import { CategoryForm } from "@/components/admin-forms";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Categorias ({categories.length})
        </h1>
        <p className="text-sm text-slate-600">
          Gerencie as categorias dos produtos.
        </p>
      </section>

      <div>
        <CategoryForm />
      </div>

      <Table headers={["ID", "Nome", "Ações"]} empty="Nenhuma categoria ainda.">
        {categories.map((cat) => (
          <CategoryRow key={cat.id} category={cat} />
        ))}
      </Table>
    </div>
  );
}

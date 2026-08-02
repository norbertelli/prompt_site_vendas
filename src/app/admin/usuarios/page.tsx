import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Table } from "@/components/table";
import { UserRow } from "@/components/admin-table";
import { CreateUserForm } from "@/components/admin-forms";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();

  const users = await prisma.user.findMany({
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
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Usuários ({users.length})
        </h1>
        <p className="text-sm text-slate-600">
          Gerencie os usuários e permissões da plataforma.
        </p>
      </section>

      <div>
        <CreateUserForm />
      </div>

      <Table
        headers={["ID", "Nome", "Email", "Telefone", "Loja", "Papel", "Criado em", "Ações"]}
        empty="Nenhum usuário ainda."
      >
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            currentUserId={session?.user?.id ?? ""}
          />
        ))}
      </Table>
    </div>
  );
}

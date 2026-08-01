"use client";

import { useActionState } from "react";
import { createCategory, createSeller, createUser, setUserRole } from "@/lib/actions/admin";

export function SellerForm() {
  const [state, formAction, pending] = useActionState(createSeller, null);
  return (
    <form
      action={formAction}
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900">Novo vendedor</h3>
      <input
        name="name"
        type="text"
        required
        placeholder="Nome do vendedor"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
      />
      <input
        name="nomeLoja"
        type="text"
        required
        placeholder="Nome da loja"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
      />
      <input
        name="email"
        type="email"
        placeholder="Email (opcional)"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Vendedor criado.</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        Criar vendedor
      </button>
    </form>
  );
}

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, null);
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input
        name="name"
        type="text"
        required
        placeholder="Nova categoria"
        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "..." : "Adicionar"}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="w-full text-sm text-green-600">Categoria adicionada.</p>
      )}
    </form>
  );
}

export function ToggleRoleButton({
  userId,
  role,
  currentUserId,
}: {
  userId: string;
  role: "ADMIN" | "USER";
  currentUserId: string;
}) {
  const [state, formAction, pending] = useActionState(setUserRole, null);
  const isSelf = userId === currentUserId;
  const target = role === "ADMIN" ? "USER" : "ADMIN";

  if (isSelf) {
    return <span className="text-xs text-slate-400">você</span>;
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Tornar este usuário ${target === "ADMIN" ? "administrador" : "cliente"}?`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="role" value={target} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-60"
      >
        {role === "ADMIN" ? "Rebaixar" : "Tornar admin"}
      </button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUser, null);
  return (
    <form
      action={formAction}
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900">Novo usuário</h3>
      <input
        name="name"
        type="text"
        required
        placeholder="Nome"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
      />
      <input
        name="phone"
        type="tel"
        placeholder="Telefone"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
      />
      <input
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="Senha"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
      />
      <input
        name="nomeLoja"
        type="text"
        placeholder="Nome da loja"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
      />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="role"
          value="ADMIN"
          className="h-4 w-4 rounded border-slate-300 text-blue-600"
        />
        Este usuário é administrador
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Usuário criado.</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        Criar usuário
      </button>
    </form>
  );
}

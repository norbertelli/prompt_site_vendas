"use client";

import { useActionState } from "react";
import { createCategory, createUser, updateUserStore } from "@/lib/actions/admin";

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

export function UserStoreForm({
  userId,
  nomeLoja,
}: {
  userId: string;
  nomeLoja: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateUserStore, null);
  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input
        name="nomeLoja"
        type="text"
        defaultValue={nomeLoja ?? ""}
        placeholder="Nome da loja"
        className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
      >
        Salvar
      </button>
      {state?.success && <span className="text-xs text-green-600">Salvo</span>}
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

"use client";

import { useEffect, useState, useTransition } from "react";
import { useActionState } from "react";
import {
  deleteCategory,
  deleteSeller,
  deleteUser,
  updateCategory,
  updateSeller,
  updateUser,
} from "@/lib/actions/admin";
import { ToggleRoleButton } from "@/components/admin-forms";

const iconBtnBase =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50";

function PencilIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Editar"
      aria-label="Editar"
      className={`${iconBtnBase} border-slate-200 text-blue-600 hover:bg-blue-50`}
    >
      <PencilIcon />
    </button>
  );
}

function SaveButton({ disabled }: { disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      title="Salvar alterações"
      aria-label="Salvar alterações"
      className={`${iconBtnBase} border-transparent bg-green-600 text-white hover:bg-green-700`}
    >
      <CheckIcon />
    </button>
  );
}

function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Cancelar"
      aria-label="Cancelar"
      className={`${iconBtnBase} border-slate-200 text-slate-500 hover:bg-slate-100`}
    >
      <XIcon />
    </button>
  );
}

function DeleteButton({
  action,
  confirmMessage,
}: {
  action: () => Promise<unknown>;
  confirmMessage: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      title="Excluir"
      aria-label="Excluir"
      onClick={() => {
        if (confirm(confirmMessage)) {
          startTransition(() => {
            void action();
          });
        }
      }}
      className={`${iconBtnBase} border-slate-200 text-red-600 hover:bg-red-50`}
    >
      <TrashIcon />
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-500";

function SuccessNote({ ok }: { ok?: boolean }) {
  return ok ? <span className="text-xs font-medium text-green-600">Salvo</span> : null;
}

function ErrorNote({ error }: { error?: string }) {
  return error ? <span className="text-xs font-medium text-red-600">{error}</span> : null;
}

export function CategoryRow({
  category,
}: {
  category: { id: string; name: string };
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateCategory, null);

  useEffect(() => {
    if (!state?.success) return;
    const t = setTimeout(() => setEditing(false), 0);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <tr className="border-b border-slate-100 last:border-0">
      {editing ? (
        <td colSpan={3} className="px-4 py-2">
          <form action={formAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={category.id} />
            <input name="name" defaultValue={category.name} required className={inputCls} />
            <SaveButton disabled={pending} />
            <CancelButton onClick={() => setEditing(false)} />
            <ErrorNote error={state?.error} />
            <SuccessNote ok={state?.success} />
          </form>
        </td>
      ) : (
        <>
          <td className="px-4 py-3 font-mono text-xs text-slate-400">{category.id}</td>
          <td className="px-4 py-3 font-medium text-slate-900">{category.name}</td>
        </>
      )}
      {!editing && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <EditButton onClick={() => setEditing(true)} />
            <DeleteButton
              action={() => deleteCategory(category.id)}
              confirmMessage="Excluir esta categoria?"
            />
          </div>
        </td>
      )}
    </tr>
  );
}

export function SellerRow({
  seller,
}: {
  seller: {
    id: string;
    name: string;
    nomeLoja: string | null;
    email: string | null;
    products: number;
  };
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateSeller, null);

  useEffect(() => {
    if (!state?.success) return;
    const t = setTimeout(() => setEditing(false), 0);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <tr className="border-b border-slate-100 last:border-0">
      {editing ? (
        <td colSpan={6} className="px-4 py-2">
          <form action={formAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={seller.id} />
            <input name="name" defaultValue={seller.name} required placeholder="Nome" className={inputCls} />
            <input name="nomeLoja" defaultValue={seller.nomeLoja ?? ""} required placeholder="Nome da loja" className={inputCls} />
            <input name="email" defaultValue={seller.email ?? ""} type="email" placeholder="Email" className={inputCls} />
            <SaveButton disabled={pending} />
            <CancelButton onClick={() => setEditing(false)} />
            <ErrorNote error={state?.error} />
            <SuccessNote ok={state?.success} />
          </form>
        </td>
      ) : (
        <>
          <td className="px-4 py-3 font-mono text-xs text-slate-400">{seller.id}</td>
          <td className="px-4 py-3 font-medium text-slate-900">{seller.name}</td>
          <td className="px-4 py-3 text-slate-600">{seller.nomeLoja}</td>
          <td className="px-4 py-3 text-slate-600">{seller.email ?? "—"}</td>
          <td className="px-4 py-3 text-slate-600">{seller.products}</td>
        </>
      )}
      {!editing && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <EditButton onClick={() => setEditing(true)} />
            <DeleteButton
              action={() => deleteSeller(seller.id)}
              confirmMessage="Excluir este vendedor?"
            />
          </div>
        </td>
      )}
    </tr>
  );
}

export function UserRow({
  user,
  currentUserId,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    nomeLoja: string | null;
    role: "ADMIN" | "USER";
    createdAt: Date | string;
  };
  currentUserId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateUser, null);
  const isSelf = user.id === currentUserId;

  useEffect(() => {
    if (!state?.success) return;
    const t = setTimeout(() => setEditing(false), 0);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <tr className="border-b border-slate-100 last:border-0">
      {editing ? (
        <td colSpan={7} className="px-4 py-2">
          <form action={formAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={user.id} />
            <input name="name" defaultValue={user.name} required placeholder="Nome" className={inputCls} />
            <input name="email" defaultValue={user.email} type="email" required placeholder="Email" className={inputCls} />
            <input name="phone" defaultValue={user.phone ?? ""} placeholder="Telefone" className={inputCls} />
            <input name="nomeLoja" defaultValue={user.nomeLoja ?? ""} placeholder="Nome da loja" className={inputCls} />
            <SaveButton disabled={pending} />
            <CancelButton onClick={() => setEditing(false)} />
            <ErrorNote error={state?.error} />
            <SuccessNote ok={state?.success} />
          </form>
        </td>
      ) : (
        <>
          <td className="px-4 py-3 font-mono text-xs text-slate-400">{user.id}</td>
          <td className="px-4 py-3 font-medium text-slate-900">
            {user.name}
            {isSelf && <span className="ml-1 text-xs text-slate-400">(você)</span>}
          </td>
          <td className="px-4 py-3 text-slate-600">{user.email}</td>
          <td className="px-4 py-3 text-slate-600">{user.phone ?? "—"}</td>
          <td className="px-4 py-3 text-slate-600">{user.nomeLoja ?? "—"}</td>
          <td className="px-4 py-3">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {user.role}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-600">
            {new Date(user.createdAt).toLocaleDateString("pt-BR")}
          </td>
        </>
      )}
      {!editing && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <EditButton onClick={() => setEditing(true)} />
            {!isSelf && (
              <DeleteButton
                action={() => deleteUser(user.id)}
                confirmMessage={`Excluir o usuário "${user.name}"?`}
              />
            )}
            <ToggleRoleButton userId={user.id} role={user.role} currentUserId={currentUserId} />
          </div>
        </td>
      )}
    </tr>
  );
}

export function BuyerRow({
  buyer,
}: {
  buyer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    orders: number;
  };
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateUser, null);

  useEffect(() => {
    if (!state?.success) return;
    const t = setTimeout(() => setEditing(false), 0);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <tr className="border-b border-slate-100 last:border-0">
      {editing ? (
        <td colSpan={6} className="px-4 py-2">
          <form action={formAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={buyer.id} />
            <input name="name" defaultValue={buyer.name} required placeholder="Nome" className={inputCls} />
            <input name="email" defaultValue={buyer.email} type="email" required placeholder="Email" className={inputCls} />
            <input name="phone" defaultValue={buyer.phone ?? ""} placeholder="Telefone" className={inputCls} />
            <SaveButton disabled={pending} />
            <CancelButton onClick={() => setEditing(false)} />
            <ErrorNote error={state?.error} />
            <SuccessNote ok={state?.success} />
          </form>
        </td>
      ) : (
        <>
          <td className="px-4 py-3 font-mono text-xs text-slate-400">{buyer.id}</td>
          <td className="px-4 py-3 font-medium text-slate-900">{buyer.name}</td>
          <td className="px-4 py-3 text-slate-600">{buyer.email}</td>
          <td className="px-4 py-3 text-slate-600">{buyer.phone ?? "—"}</td>
          <td className="px-4 py-3 text-slate-600">{buyer.orders}</td>
        </>
      )}
      {!editing && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <EditButton onClick={() => setEditing(true)} />
            <DeleteButton
              action={() => deleteUser(buyer.id)}
              confirmMessage={`Excluir o comprador "${buyer.name}"? Isso remove o histórico de pedidos.`}
            />
          </div>
        </td>
      )}
    </tr>
  );
}

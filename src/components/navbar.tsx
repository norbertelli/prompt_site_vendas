"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart-context";

function LockIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UsersIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function Navbar({
  user,
}: {
  user?: { name: string; nomeLoja: string | null; role: "ADMIN" | "USER" } | null;
}) {
  const pathname = usePathname();
  const { count } = useCart();

  const brand = user?.nomeLoja || "LojaVendas";

  const linkCls = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-slate-800 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" className="truncate text-lg font-bold tracking-tight text-slate-900">
            {brand}
          </Link>
          <Link
            href="/admin"
            className="ml-1 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            title="Área restrita ao administrador"
          >
            <LockIcon />
            Administrador
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <Link href="/" className={linkCls("/")}>
            Loja
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/dashboard" className={linkCls("/dashboard")}>
              Produtos
            </Link>
          )}
          <Link href="/cart" className={linkCls("/cart")}>
            Carrinho
            {count > 0 && (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:inline">
                {user.name}
              </span>
              <form action="/api/auth/signout" method="post">
                <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <UsersIcon />
              Entre ou cadastre-se
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

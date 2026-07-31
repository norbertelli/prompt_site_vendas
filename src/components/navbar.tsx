"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart-context";

export function Navbar({
  user,
}: {
  user?: { name: string; role: "ADMIN" | "USER" } | null;
}) {
  const pathname = usePathname();
  const { count } = useCart();

  const linkCls = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-slate-800 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          Loja<span className="text-blue-600">Vendas</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/store" className={linkCls("/store")}>
            Loja
          </Link>
          {user && (
            <Link href="/dashboard" className={linkCls("/dashboard")}>
              Meus produtos
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className={linkCls("/admin")}>
              Admin
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
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/vendedores", label: "Vendedores" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/compradores", label: "Compradores" },
  { href: "/admin/vendas", label: "Vendas" },
  { href: "/admin/produtos", label: "Produtos" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:pb-0">
      {links.map((link) => {
        const isActive =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

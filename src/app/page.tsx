import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Sua loja com{" "}
          <span className="text-blue-600">produtos organizados</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-slate-600">
          Compre por categoria, acesse livros em PDF e pague com segurança via
          PayPal.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/store"
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Ver produtos
        </Link>
        {session?.user ? (
          session.user.role === "ADMIN" ? (
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Gerenciar produtos
            </Link>
          ) : (
            <Link
              href="/store"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Explorar a loja
            </Link>
          )
        ) : (
          <Link
            href="/register"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Criar conta
          </Link>
        )}
      </div>

      <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "Categorias",
            desc: "Produtos organizados por categoria, incluindo livros com PDF.",
          },
          {
            title: "Compre na loja",
            desc: "Filtros por categoria, loja, busca e faixa de preço.",
          },
          {
            title: "Pague com PayPal",
            desc: "Checkout integrado e seguro com PayPal.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm"
          >
            <h3 className="mb-1 font-semibold text-slate-900">{f.title}</h3>
            <p className="text-sm text-slate-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

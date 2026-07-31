"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { formatBRL } from "@/lib/format";

export default function CartPage() {
  const { items, total, setQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível iniciar o pagamento.");
        return;
      }

      window.location.href = data.approveUrl;
    } catch {
      setError("Erro de conexão ao iniciar o pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Carrinho de compras</h1>
        <p className="text-sm text-slate-600">Revise seus itens antes de pagar.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-500">Seu carrinho está vazio.</p>
          <Link
            href="/store"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Ir para a loja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ul className="space-y-3 lg:col-span-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">
                    {formatBRL(item.price)} cada
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
                <span className="w-20 text-right font-semibold text-slate-900">
                  {formatBRL(item.price * item.quantity)}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>

          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Resumo</h2>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-slate-600">Total</span>
              <span className="text-2xl font-bold text-slate-900">
                {formatBRL(total)}
              </span>
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-lg bg-[#003087] px-4 py-3 text-sm font-bold text-white shadow hover:bg-[#002e80] disabled:opacity-60"
            >
              {loading ? "Redirecionando para o PayPal..." : "Pagar com PayPal"}
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">
              Você será redirecionado ao PayPal para concluir o pagamento.
            </p>

            <button
              onClick={clearCart}
              className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Limpar carrinho
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

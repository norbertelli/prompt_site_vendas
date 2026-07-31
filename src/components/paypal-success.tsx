"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-context";

export function PayPalSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    let cancelled = false;

    (async () => {
      if (!token) {
        if (cancelled) return;
        setMessage("Nenhuma referência de pagamento encontrada.");
        setState("error");
        return;
      }

      try {
        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: token }),
        });

        const data = await res.json();

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (cancelled) return;

        if (!res.ok) {
          setMessage(data.error || "Não foi possível confirmar o pagamento.");
          setState("error");
          return;
        }

        setOrderId(data.id);
        setState("done");
        clearCart();
      } catch {
        if (cancelled) return;
        setMessage("Erro de conexão ao confirmar o pagamento.");
        setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, clearCart]);

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {state === "loading" && (
          <>
            <h1 className="mb-2 text-xl font-bold text-slate-900">
              Confirmando pagamento
            </h1>
            <p className="text-sm text-slate-600">
              Aguarde enquanto confirmamos seu pedido no PayPal...
            </p>
          </>
        )}

        {state === "done" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
              ✓
            </div>
            <h1 className="mb-2 text-xl font-bold text-slate-900">
              Pagamento aprovado!
            </h1>
            <p className="text-sm text-slate-600">
              Seu pedido foi confirmado.
              {orderId && (
                <>
                  {" "}
                  Código do pedido:{" "}
                  <span className="font-mono font-semibold text-slate-900">
                    {orderId}
                  </span>
                </>
              )}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/store"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Continuar comprando
              </Link>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
              !
            </div>
            <h1 className="mb-2 text-xl font-bold text-slate-900">
              Não foi possível confirmar o pagamento
            </h1>
            <p className="text-sm text-slate-600">{message}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/cart"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Voltar ao carrinho
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

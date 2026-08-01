"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { formatBRL } from "@/lib/format";

type StoreProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  hasImage: boolean;
  categoryName: string;
  sellerName: string;
  hasPdf: boolean;
  pdfUnlocked: boolean;
};

export function ProductCard({ product }: { product: StoreProduct }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [open, setOpen] = useState(false);

  function addToCart() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  function handleGoToPayment() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    setOpen(false);
    router.push("/cart");
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        <div className="flex h-44 items-center justify-center bg-slate-100">
          {product.hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/products/${product.id}/image`}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-slate-400">Sem imagem</span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              {product.categoryName}
            </span>
            {product.hasPdf && product.pdfUnlocked && (
              <a
                href={`/api/products/${product.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Ver PDF
              </a>
            )}
            {product.hasPdf && !product.pdfUnlocked && (
              <span className="text-xs text-slate-400" title="Liberado após a compra">
                PDF na compra
              </span>
            )}
          </div>
          <h3 className="line-clamp-1 font-semibold text-slate-900">{product.name}</h3>
          <p className="line-clamp-2 flex-1 text-sm text-slate-600">
            {product.description}
          </p>
          <p className="text-xs text-slate-400">Loja: {product.sellerName}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-slate-900">
              {formatBRL(product.price)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart();
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {added ? "Adicionado!" : "Adicionar"}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
          >
            <div className="flex h-52 items-center justify-center bg-slate-100">
              {product.hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/products/${product.id}/image`}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm text-slate-400">Sem imagem</span>
              )}
            </div>
            <div className="space-y-3 p-6">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {product.categoryName}
                </span>
                <span className="text-xs text-slate-400">Loja: {product.sellerName}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
              <p className="text-sm text-slate-600">{product.description}</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatBRL(product.price)}
              </p>
              {product.hasPdf && !product.pdfUnlocked && (
                <p className="text-xs text-slate-500">PDF incluso na compra deste item.</p>
              )}

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  onClick={() => {
                    addToCart();
                    setOpen(false);
                  }}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Adicionar ao carrinho
                </button>
                <button
                  onClick={handleGoToPayment}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Ir para o pagamento
                </button>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-full text-center text-sm text-slate-400 hover:text-slate-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

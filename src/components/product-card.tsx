"use client";

import { useState } from "react";
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
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
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
            onClick={handleAdd}
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
  );
}

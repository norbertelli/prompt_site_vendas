"use client";

import { deleteProduct } from "@/lib/actions/products";

export function DeleteProductButton({ productId }: { productId: string }) {
  return (
    <form
      action={deleteProduct.bind(null, productId)}
      onSubmit={(e) => {
        if (!confirm("Excluir este produto?")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Excluir
      </button>
    </form>
  );
}

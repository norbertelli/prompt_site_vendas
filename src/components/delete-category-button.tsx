"use client";

import { deleteCategory } from "@/lib/actions/admin";

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  return (
    <form
      action={deleteCategory.bind(null, categoryId)}
      onSubmit={(e) => {
        if (!confirm("Excluir esta categoria?")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="text-sm text-red-500 hover:text-red-700"
        title="Excluir"
      >
        Excluir
      </button>
    </form>
  );
}

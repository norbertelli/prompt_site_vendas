"use client";

import { useRef, useState } from "react";
import { useActionState } from "react";
import { createProduct, updateProduct } from "@/lib/actions/products";

type ProductFormProps = {
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    sellerId: string;
    imageUrl: string | null;
    pdfUrl: string | null;
  };
  categories: { id: string; name: string }[];
  sellers: { id: string; name: string; nomeLoja: string | null }[];
};

export function ProductForm({ product, categories, sellers }: ProductFormProps) {
  const action = product ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState(action, null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(product?.imageUrl ?? null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pdfDragOver, setPdfDragOver] = useState(false);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [removePdf, setRemovePdf] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isLivros = selectedCategory?.name.toLowerCase() === "livros";

  function setFileInput(input: HTMLInputElement | null, file: File) {
    if (!input) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB.");
      return;
    }
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setFileInput(fileInputRef.current, file);
  }

  function handlePdf(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Selecione um arquivo PDF.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert("O PDF deve ter no máximo 20MB.");
      return;
    }
    setPdfName(file.name);
    setRemovePdf(false);
    setFileInput(pdfInputRef.current, file);
  }

  return (
    <form action={formAction} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Nome do produto
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={product?.name}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={product?.description}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="categoryId" className="mb-1 block text-sm font-medium text-slate-700">
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setRemovePdf(true);
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium text-slate-700">
            Valor (R$)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            step="0.01"
            min="0.01"
            defaultValue={product?.price}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="sellerId" className="mb-1 block text-sm font-medium text-slate-700">
          Vendedor (loja)
        </label>
        <select
          id="sellerId"
          name="sellerId"
          required
          defaultValue={product?.sellerId ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="" disabled>
            Selecione o vendedor
          </option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nomeLoja || s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Imagem do produto
        </label>
        <div
          role="button"
          tabIndex={0}
          aria-label="Enviar imagem do produto"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
          }`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Prévia do produto"
              className="max-h-48 max-w-full rounded-lg object-contain"
            />
          ) : (
            <div className="text-slate-500">
              <p className="font-medium">Arraste e solte a imagem aqui</p>
              <p className="text-sm">ou clique para selecionar (máx. 5MB)</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name="image"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {fileName && <p className="mt-1 text-xs text-slate-500">{fileName}</p>}
        {product?.imageUrl && !fileName && (
          <p className="mt-1 text-xs text-slate-500">
            O produto já possui imagem. Envie outra para substituí-la.
          </p>
        )}
      </div>

      {isLivros && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Arquivo PDF do livro
          </label>
          <div
            role="button"
            tabIndex={0}
            aria-label="Enviar arquivo PDF do livro"
            onClick={() => pdfInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") pdfInputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setPdfDragOver(true);
            }}
            onDragLeave={() => setPdfDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setPdfDragOver(false);
              handlePdf(e.dataTransfer.files);
            }}
            className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
              pdfDragOver
                ? "border-green-500 bg-green-50"
                : "border-slate-300 bg-slate-50 hover:border-green-400 hover:bg-green-50/50"
            }`}
          >
            {pdfName || (!removePdf && product?.pdfUrl) ? (
              <div className="text-slate-700">
                <p className="font-medium">📄 {pdfName || "Arquivo PDF anexado"}</p>
                <p className="text-sm">Solte um novo arquivo para substituir</p>
              </div>
            ) : (
              <div className="text-slate-500">
                <p className="font-medium">Arraste e solte o PDF aqui</p>
                <p className="text-sm">ou clique para selecionar (máx. 20MB)</p>
              </div>
            )}
          </div>
          <input
            ref={pdfInputRef}
            type="file"
            name="pdf"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => handlePdf(e.target.files)}
          />
          {!removePdf && product?.pdfUrl && (
            <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="removePdf"
                value="1"
                checked={removePdf}
                onChange={(e) => setRemovePdf(e.target.checked)}
              />
              Remover PDF existente
            </label>
          )}
        </div>
      )}
      {!isLivros && (
        <input type="hidden" name="removePdf" value="1" />
      )}

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Produto salvo com sucesso.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Salvando..." : product ? "Salvar alterações" : "Cadastrar produto"}
      </button>
    </form>
  );
}

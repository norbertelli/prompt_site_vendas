"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_PDF = 20 * 1024 * 1024;

async function readFile(
  file: File,
  maxSize: number
): Promise<{ error?: string; buffer: Uint8Array<ArrayBuffer> }> {
  if (file.size > maxSize) {
    return { error: `O arquivo deve ter no máximo ${maxSize / 1024 / 1024}MB.`, buffer: new Uint8Array() };
  }
  return { buffer: new Uint8Array(await file.arrayBuffer()) };
}

function fileError(result: Awaited<ReturnType<typeof readFile>>) {
  return result.error || null;
}

export async function createProduct(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Somente o administrador pode cadastrar produtos." };

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const categoryId = String(formData.get("categoryId") || "");
  const sellerId = String(formData.get("sellerId") || "");
  const priceRaw = String(formData.get("price") || "").trim();
  const image = formData.get("image");
  const pdf = formData.get("pdf");

  if (!name) return { error: "Informe o nome do produto." };
  if (!description) return { error: "Informe a descrição do produto." };
  if (!categoryId) return { error: "Selecione uma categoria." };
  if (!sellerId) return { error: "Selecione o vendedor." };

  const price = Number(priceRaw.replace(",", "."));
  if (!Number.isFinite(price) || price <= 0) return { error: "Informe um valor válido." };

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Categoria inválida." };

  const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
  if (!seller) return { error: "Vendedor inválido." };

  let imageBuffer: Uint8Array<ArrayBuffer> | null = null;
  let imageType: string | null = null;

  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) return { error: "O arquivo deve ser uma imagem." };
    const res = await readFile(image, MAX_IMAGE);
    const err = fileError(res);
    if (err) return { error: err };
    imageBuffer = res.buffer;
    imageType = image.type;
  }

  let pdfBuffer: Uint8Array<ArrayBuffer> | null = null;
  let pdfType: string | null = null;

  const isLivros = category.name.toLowerCase() === "livros";
  if (pdf instanceof File && pdf.size > 0) {
    if (!isLivros) return { error: "O arquivo PDF só pode ser anexado em produtos da categoria Livros." };
    if (!pdf.type.includes("pdf") && !pdf.name.toLowerCase().endsWith(".pdf")) {
      return { error: "O arquivo deve ser um PDF." };
    }
    const res = await readFile(pdf, MAX_PDF);
    const err = fileError(res);
    if (err) return { error: err };
    pdfBuffer = res.buffer;
    pdfType = pdf.type || "application/pdf";
  }

  await prisma.product.create({
    data: {
      name,
      description,
      price,
      categoryId,
      image: imageBuffer,
      imageType,
      pdf: pdfBuffer,
      pdfType,
      sellerId,
    },
  });

  revalidatePath("/store");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateProduct(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão." };

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const categoryId = String(formData.get("categoryId") || "");
  const sellerId = String(formData.get("sellerId") || "");
  const priceRaw = String(formData.get("price") || "").trim();
  const image = formData.get("image");
  const pdf = formData.get("pdf");
  const removePdf = formData.get("removePdf") === "1";

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { error: "Produto não encontrado." };

  const price = Number(priceRaw.replace(",", "."));
  if (!Number.isFinite(price) || price <= 0) return { error: "Informe um valor válido." };

  const category = categoryId
    ? await prisma.category.findUnique({ where: { id: categoryId } })
    : existing.categoryId
      ? await prisma.category.findUnique({ where: { id: existing.categoryId } })
      : null;
  if (!category) return { error: "Categoria inválida." };

  if (sellerId) {
    const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!seller) return { error: "Vendedor inválido." };
  }

  let imageBuffer: Uint8Array<ArrayBuffer> | null = existing.image;
  let imageType: string | null = existing.imageType;

  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) return { error: "O arquivo deve ser uma imagem." };
    const res = await readFile(image, MAX_IMAGE);
    const err = fileError(res);
    if (err) return { error: err };
    imageBuffer = res.buffer;
    imageType = image.type;
  }

  const isLivros = category.name.toLowerCase() === "livros";

  let pdfBuffer: Uint8Array<ArrayBuffer> | null = existing.pdf;
  let pdfType: string | null = existing.pdfType;

  if (removePdf || !isLivros) {
    pdfBuffer = null;
    pdfType = null;
  }

  if (pdf instanceof File && pdf.size > 0) {
    if (!isLivros) return { error: "O arquivo PDF só pode ser anexado em produtos da categoria Livros." };
    if (!pdf.type.includes("pdf") && !pdf.name.toLowerCase().endsWith(".pdf")) {
      return { error: "O arquivo deve ser um PDF." };
    }
    const res = await readFile(pdf, MAX_PDF);
    const err = fileError(res);
    if (err) return { error: err };
    pdfBuffer = res.buffer;
    pdfType = pdf.type || "application/pdf";
  }

  await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price,
      categoryId: category.id,
      image: imageBuffer,
      imageType,
      pdf: pdfBuffer,
      pdfType,
      ...(sellerId ? { sellerId } : {}),
    },
  });

  revalidatePath("/store");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return;

  await prisma.product.delete({ where: { id } });
  revalidatePath("/store");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

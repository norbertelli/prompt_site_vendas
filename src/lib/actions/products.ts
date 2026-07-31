"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createProduct(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Faça login para cadastrar produtos." };

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceRaw = String(formData.get("price") || "").trim();
  const image = formData.get("image");

  if (!name) return { error: "Informe o nome do produto." };
  if (!description) return { error: "Informe a descrição do produto." };

  const price = Number(priceRaw.replace(",", "."));
  if (!Number.isFinite(price) || price <= 0) return { error: "Informe um valor válido." };

  let imageBuffer: Uint8Array<ArrayBuffer> | null = null;
  let imageType: string | null = null;

  if (image instanceof File && image.size > 0) {
    if (image.size > 5 * 1024 * 1024) return { error: "A imagem deve ter no máximo 5MB." };
    if (!image.type.startsWith("image/")) return { error: "O arquivo deve ser uma imagem." };
    imageBuffer = new Uint8Array(await image.arrayBuffer());
    imageType = image.type;
  }

  await prisma.product.create({
    data: {
      name,
      description,
      price,
      image: imageBuffer,
      imageType,
      sellerId: session.user.id,
    },
  });

  revalidatePath("/store");
  revalidatePath("/dashboard");
}

export async function updateProduct(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Faça login." };

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceRaw = String(formData.get("price") || "").trim();
  const image = formData.get("image");

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { error: "Produto não encontrado." };
  if (existing.sellerId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Sem permissão para editar este produto." };
  }

  const price = Number(priceRaw.replace(",", "."));
  if (!Number.isFinite(price) || price <= 0) return { error: "Informe um valor válido." };

  let imageBuffer: Uint8Array<ArrayBuffer> | null = existing.image;
  let imageType: string | null = existing.imageType;

  if (image instanceof File && image.size > 0) {
    if (image.size > 5 * 1024 * 1024) return { error: "A imagem deve ter no máximo 5MB." };
    if (!image.type.startsWith("image/")) return { error: "O arquivo deve ser uma imagem." };
    imageBuffer = new Uint8Array(await image.arrayBuffer());
    imageType = image.type;
  }

  await prisma.product.update({
    where: { id },
    data: { name, description, price, image: imageBuffer, imageType },
  });

  revalidatePath("/store");
  revalidatePath("/dashboard");
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  if (product.sellerId !== session.user.id && session.user.role !== "ADMIN") {
    return;
  }

  await prisma.product.delete({ where: { id } });
  revalidatePath("/store");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

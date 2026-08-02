"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createUser(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão." };

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");
  const nomeLoja = String(formData.get("nomeLoja") || "").trim();
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "USER";

  if (!name || !email || !password) return { error: "Preencha nome, email e senha." };
  if (password.length < 6) return { error: "A senha deve ter pelo menos 6 caracteres." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email inválido." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Já existe um usuário com este email." };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, phone: phone || null, passwordHash, role, nomeLoja: nomeLoja || null },
  });

  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function createSeller(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão." };

  const name = String(formData.get("name") || "").trim();
  const nomeLoja = String(formData.get("nomeLoja") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!name) return { error: "Informe o nome do vendedor." };
  if (!nomeLoja) return { error: "Informe o nome da loja." };

  await prisma.seller.create({
    data: { name, nomeLoja, email: email || null },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteSeller(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return;

  const products = await prisma.product.count({ where: { sellerId: id } });
  if (products > 0) return;

  await prisma.seller.delete({ where: { id } });
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard");
}

export async function createCategory(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão." };

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Informe o nome da categoria." };

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return { error: "Já existe uma categoria com este nome." };

  await prisma.category.create({ data: { name } });
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return;

  const products = await prisma.product.count({ where: { categoryId: id } });
  if (products > 0) return;

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard");
}

export async function updateUserStore(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão." };

  const id = String(formData.get("userId") || "");
  const nomeLoja = String(formData.get("nomeLoja") || "").trim();

  if (!id) return { error: "Usuário inválido." };

  await prisma.user.update({
    where: { id },
    data: { nomeLoja: nomeLoja || null },
  });

  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function updateCategory(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão." };

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();

  if (!id || !name) return { error: "Informe o nome da categoria." };

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing && existing.id !== id) return { error: "Já existe uma categoria com este nome." };

  await prisma.category.update({ where: { id }, data: { name } });
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateSeller(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão." };

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const nomeLoja = String(formData.get("nomeLoja") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!id || !name) return { error: "Informe o nome do vendedor." };
  if (!nomeLoja) return { error: "Informe o nome da loja." };

  await prisma.seller.update({
    where: { id },
    data: { name, nomeLoja, email: email || null },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateUser(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão." };

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const nomeLoja = String(formData.get("nomeLoja") || "").trim();

  if (!id || !name || !email) return { error: "Preencha nome e email." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email inválido." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== id) return { error: "Já existe um usuário com este email." };

  await prisma.user.update({
    where: { id },
    data: { name, email, phone: phone || null, nomeLoja: nomeLoja || null },
  });

  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function setUserRole(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão." };

  const id = String(formData.get("userId") || "");
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "USER";
  if (!id) return { error: "Usuário inválido." };
  if (id === session.user.id) return { error: "Você não pode alterar seu próprio papel." };

  await prisma.user.update({
    where: { id },
    data: { role },
  });

  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return;
  if (id === session.user.id) return { error: "Você não pode excluir a si mesmo." };

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin", "layout");
}

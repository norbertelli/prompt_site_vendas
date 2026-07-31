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
  const password = String(formData.get("password") || "");
  const nomeLoja = String(formData.get("nomeLoja") || "").trim();

  if (!name || !email || !password) return { error: "Preencha nome, email e senha." };
  if (password.length < 6) return { error: "A senha deve ter pelo menos 6 caracteres." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email inválido." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Já existe um usuário com este email." };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "USER", nomeLoja: nomeLoja || null },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function createCategory(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão." };

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Informe o nome da categoria." };

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return { error: "Já existe uma categoria com este nome." };

  await prisma.category.create({ data: { name } });
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return;

  const products = await prisma.product.count({ where: { categoryId: id } });
  if (products > 0) return;

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin");
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

  revalidatePath("/admin");
  return { success: true };
}

export async function setUserAdmin(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão." };

  const id = String(formData.get("userId") || "");
  if (!id) return { error: "Usuário inválido." };
  if (id === session.user.id) return { error: "Você não pode alterar seu próprio papel." };

  await prisma.user.update({
    where: { id },
    data: { role: "ADMIN" },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return;
  if (id === session.user.id) return { error: "Você não pode excluir a si mesmo." };

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin");
}

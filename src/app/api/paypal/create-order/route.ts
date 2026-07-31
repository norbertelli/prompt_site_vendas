import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (!isPayPalConfigured()) {
    return Response.json(
      { error: "PayPal não configurado. Defina PAYPAL_CLIENT_ID e PAYPAL_CLIENT_SECRET no .env." },
      { status: 500 }
    );
  }

  let items: { id: string; name: string; quantity: number; price: number }[];
  try {
    const body = (await request.json()) as { items?: unknown };
    items = Array.isArray(body.items) ? body.items : [];
  } catch {
    return Response.json({ error: "Corpo inválido" }, { status: 400 });
  }

  if (items.length === 0) {
    return Response.json({ error: "Carrinho vazio" }, { status: 400 });
  }

  const validated: { product: { id: string; name: string; price: number }; quantity: number }[] = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.id } });
    if (!product) {
      return Response.json(
        { error: `Produto ${item.id} não encontrado` },
        { status: 400 }
      );
    }
    if (Number(item.quantity) <= 0 || !Number.isInteger(Number(item.quantity))) {
      return Response.json({ error: "Quantidade inválida" }, { status: 400 });
    }
    if (Math.abs(Number(product.price) - Number(item.price)) > 0.001) {
      return Response.json(
        { error: `Preço do produto ${product.name} desatualizado. Atualize o carrinho.` },
        { status: 400 }
      );
    }
    validated.push({
      product: { id: product.id, name: product.name, price: Number(product.price) },
      quantity: Number(item.quantity),
    });
  }

  try {
    const paypalItems = validated.map((v) => ({
      id: v.product.id,
      name: v.product.name,
      quantity: v.quantity,
      price: Number(v.product.price),
    }));

    const result = await createPayPalOrder(paypalItems);

    const total = paypalItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        status: "PENDING",
        paypalOrderId: result.id,
        items: {
          create: validated.map((v) => ({
            productId: v.product.id,
            quantity: v.quantity,
            price: v.product.price,
          })),
        },
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error("create-order error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao criar pedido no PayPal" },
      { status: 500 }
    );
  }
}

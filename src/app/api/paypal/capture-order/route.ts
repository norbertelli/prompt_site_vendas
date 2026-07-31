import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (!isPayPalConfigured()) {
    return Response.json({ error: "PayPal não configurado." }, { status: 500 });
  }

  let orderId: string;
  try {
    const body = (await request.json()) as { orderId?: string };
    orderId = body.orderId || "";
  } catch {
    return Response.json({ error: "Corpo inválido" }, { status: 400 });
  }

  if (!orderId) {
    return Response.json({ error: "orderId ausente" }, { status: 400 });
  }

  const pending = await prisma.order.findUnique({
    where: { paypalOrderId: orderId },
  });
  if (pending && pending.status === "COMPLETED") {
    return Response.json({ id: pending.id, status: pending.status });
  }

  try {
    const captured = await capturePayPalOrder(orderId);

    if (captured.status !== "COMPLETED") {
      return Response.json(
        { error: `Pagamento não concluído: ${captured.status}` },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { paypalOrderId: orderId },
      data: { status: "COMPLETED" },
    });

    return Response.json({ id: order.id, status: order.status });
  } catch (error) {
    console.error("capture-order error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao capturar pagamento" },
      { status: 500 }
    );
  }
}

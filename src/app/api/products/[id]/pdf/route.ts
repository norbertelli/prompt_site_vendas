import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Não autenticado", { status: 401 });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: { pdf: true, pdfType: true, name: true },
  });

  if (!product?.pdf) {
    return new Response(null, { status: 404 });
  }

  if (session.user.role === "ADMIN") {
    return pdfResponse(product.name, product.pdf, product.pdfType);
  }

  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId: id,
      order: { userId: session.user.id, status: "COMPLETED" },
    },
    select: { id: true },
  });

  if (!purchased) {
    return new Response("Pagamento não confirmado", { status: 403 });
  }

  return pdfResponse(product.name, product.pdf, product.pdfType);
}

function pdfResponse(name: string, pdf: Uint8Array<ArrayBuffer> | null, pdfType: string | null) {
  return new Response(pdf, {
    headers: {
      "Content-Type": pdfType || "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(name)}.pdf`,
      "Cache-Control": "private, no-store",
    },
  });
}

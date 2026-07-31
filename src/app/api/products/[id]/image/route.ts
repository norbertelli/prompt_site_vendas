import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { image: true, imageType: true },
  });

  if (!product?.image) {
    return new Response(null, { status: 404 });
  }

  return new Response(new Uint8Array(product.image), {
    headers: {
      "Content-Type": product.imageType || "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@loja.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Administrador";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin já existe: ${email}`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, email, passwordHash, role: "ADMIN", nomeLoja: "Loja Oficial" },
    });
    console.log(`Admin criado: ${email} / ${password}`);
  }

  const categories = ["Livros", "Eletrônicos", "Roupas", "Casa e Jardim", "Outros"];

  for (const nameCat of categories) {
    const category = await prisma.category.findUnique({ where: { name: nameCat } });
    if (!category) {
      await prisma.category.create({ data: { name: nameCat } });
      console.log(`Categoria criada: ${nameCat}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

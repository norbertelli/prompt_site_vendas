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
      data: {
        name,
        email,
        phone: process.env.ADMIN_PHONE || "(00) 00000-0000",
        passwordHash,
        role: "ADMIN",
        nomeLoja: "Loja Oficial",
      },
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

  const sellerEmail = (process.env.SELLER_EMAIL || "vendedor@loja.com").toLowerCase();
  let seller = await prisma.seller.findFirst({ where: { email: sellerEmail } });
  if (!seller) {
    seller = await prisma.seller.create({
      data: { name: "Vendedor Padrão", nomeLoja: "Loja Oficial", email: sellerEmail },
    });
    console.log(`Vendedor criado: ${sellerEmail}`);
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    const categoryByName = new Map<string, { id: string; name: string }>();
    for (const nameCat of categories) {
      const cat = await prisma.category.findUnique({ where: { name: nameCat } });
      if (cat) categoryByName.set(nameCat, cat);
    }

    const sampleProducts: Array<{ name: string; description: string; price: string; category: string }> = [
      {
        name: "Livro: A Arte da Programação",
        description:
          "Guia completo sobre boas práticas, algoritmos e estrutura de dados para quem quer evoluir como desenvolvedor.",
        price: "89.90",
        category: "Livros",
      },
      {
        name: "Livro: Marketing Digital na Prática",
        description:
          "Aprenda estratégias de tráfego, redes sociais e vendas online com exemplos reais de mercado.",
        price: "59.90",
        category: "Livros",
      },
      {
        name: "Fone de Ouvido Bluetooth",
        description:
          "Fone sem fio com cancelamento de ruído, bateria de longa duração e som de alta qualidade.",
        price: "199.90",
        category: "Eletrônicos",
      },
      {
        name: "Smartwatch Fitness",
        description:
          "Relógio inteligente com monitoramento de batimentos, passos, sono e notificações do celular.",
        price: "349.90",
        category: "Eletrônicos",
      },
      {
        name: "Camiseta Básica Premium",
        description:
          "Camiseta 100% algodão, toque macio e modelagem confortável para o dia a dia.",
        price: "49.90",
        category: "Roupas",
      },
      {
        name: "Kit Vasos e Suculentas",
        description:
          "Conjunto com 3 vasos decorativos e suculentas naturais para dar vida à sua casa.",
        price: "79.90",
        category: "Casa e Jardim",
      },
    ];

    for (const p of sampleProducts) {
      const cat = categoryByName.get(p.category);
      if (!cat) continue;
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          categoryId: cat.id,
          sellerId: seller.id,
        },
      });
    }
    console.log(`Produtos de exemplo criados: ${sampleProducts.length}`);
  } else {
    console.log(`Já existem ${productCount} produtos.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { CartProvider } from "@/components/cart-context";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LojaVendas - E-commerce",
  description: "Loja com categorias, livros em PDF e pagamento via PayPal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Navbar
            user={
              session?.user
                ? {
                    name: session.user.name ?? "Usuário",
                    nomeLoja: session.user.nomeLoja ?? null,
                    role: session.user.role,
                  }
                : null
            }
          />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
            LojaVendas © {new Date().getFullYear()}
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}

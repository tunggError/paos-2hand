import type { Metadata } from "next";
import { Montserrat, Inter, Anton } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { CartProvider } from "@/context/CartContext";

const headingFont = Montserrat({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
});

const antonFont = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PAOS 2HAND - Streetwear & Vintage",
  description: "Cửa hàng đồ si tuyển chọn phong cách đường phố",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${headingFont.variable} ${bodyFont.variable} ${antonFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <CartProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}

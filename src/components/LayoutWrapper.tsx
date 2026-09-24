"use client";

import { usePathname } from 'next/navigation';
import Header from "./Header";
import Footer from "./Footer";
import CartSidebar from "./CartSidebar";
import SplashScreen from "./SplashScreen";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return (
      <main className="flex-1 flex flex-col bg-[#F3F4F6] min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <>
      <SplashScreen />
      <CartSidebar />
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}

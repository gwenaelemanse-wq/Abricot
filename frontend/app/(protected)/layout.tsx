"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);

return (
  <div className="min-h-screen bg-gray-100">
    <ProtectedHeader />

    <main className="mx-auto max-w-7xl px-20 py-12">
      {children}
    </main>

    <ProtectedFooter />
  </div>
);
}

export function ProtectedHeader() {
  return (
    <header className="mx-4 mt-4 bg-white">
      <nav className="flex h-20 items-center justify-between px-20">
        <img src="/images/Color=orange.png" alt="LogoOrange" className="h-12 w-auto" />

        <div className="flex items-center gap-24 text-orange-600">
          <Link href="/dashboard">▦ Tableau de bord</Link>
          <Link href="/projects">📁 Projets</Link>
        </div>

        <Link
          href="/account"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-sm"
        >
          AD
        </Link>
      </nav>
    </header>
  );
}

export function ProtectedFooter() {
  return (
    <footer className="mx-4 mb-4 mt-8 bg-white">
      <div className="flex h-12 items-center justify-between px-8">
        <img src="/images/Color=black.png" alt="LogoBlack" className="h-8 w-auto" />
        <p className="text-sm text-black">Abricot 2025</p>
      </div>
    </footer>
  );
}
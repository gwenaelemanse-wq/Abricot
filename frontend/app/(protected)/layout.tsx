"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { LayoutDashboard, Folder } from "lucide-react";
import { usePathname } from "next/navigation";

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
    <ProtectedHeader pathname={usePathname()} />

    <main className="mx-auto max-w-7xl px-20 py-12">
      {children}
    </main>

    <ProtectedFooter />
  </div>
);
}

export function ProtectedHeader({ pathname }: { pathname: string }) {
  return (
    <header className="mx-4 mt-4 bg-white">
      <nav className="flex h-20 items-center justify-between px-20">
        <img src="/images/Color=orange.png" alt="LogoOrange" className="mt-16 w-[147px] h-[20px] mb-16" />

        <div className="flex items-center gap-10">
  <Link
    href="/dashboard"
    className={`flex items-center gap-3 rounded-md px-6 py-3 text-sm transition ${
      pathname === "/dashboard"
        ? "bg-neutral-900 text-white"
        : "text-orange-600 hover:bg-orange-50"
    }`}
  >
    <LayoutDashboard size={18} />
    <span>Tableau de bord</span>
  </Link>

  <Link
    href="/projects"
    className={`flex items-center gap-3 rounded-md px-6 py-3 text-sm transition ${
      pathname.startsWith("/projects")
        ? "bg-neutral-900 text-white"
        : "text-orange-700 hover:bg-orange-50"
    }`}
  >
    <Folder size={18} />
    <span>Projets</span>
  </Link>
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
        <img src="/images/Color=black.png" alt="LogoBlack" className="mt-16 w-[101px] h-[13px] mb-16" />
        <p className="text-sm text-black">Abricot 2025</p>
      </div>
    </footer>
  );
}
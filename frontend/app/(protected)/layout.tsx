"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { LayoutDashboard, Folder } from "lucide-react";
import { usePathname } from "next/navigation";

function getInitials(person: { name: string | null; email: string }): string {
  if (person.name && person.name.trim().length > 0) {
    return person.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  return person.email.slice(0, 2).toUpperCase();
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userInitials, setUserInitials] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    // sessionStorage n'est pas disponible côté serveur : on ne peut
    // lire l'utilisateur connecté qu'après le montage, côté client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const user: { name: string | null; email: string } =
          JSON.parse(storedUser);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserInitials(getInitials(user));
      } catch {
        // JSON invalide, on ignore
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <ProtectedHeader
        pathname={usePathname()}
        userInitials={userInitials}
      />

      <main className="mx-auto max-w-7xl px-20 py-12">
        {children}
      </main>

      <ProtectedFooter />
    </div>
  );
}

export function ProtectedHeader({
  pathname,
  userInitials,
}: {
  pathname: string;
  userInitials: string;
}) {
  return (
    <header className="mx-4 mt-4 bg-white">
      <nav className="flex h-20 items-center justify-between px-20">
        <img
          src="/images/Color=orange.png"
          alt="LogoOrange"
          className="mt-16 w-[147px] h-[20px] mb-16"
        />

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
          {userInitials}
        </Link>
      </nav>
    </header>
  );
}

export function ProtectedFooter() {
  return (
    <footer className="mx-4 mb-4 mt-8 bg-white">
      <div className="flex h-12 items-center justify-between px-8">
        <img
          src="/images/Color=black.png"
          alt="LogoBlack"
          className="mt-16 w-[101px] h-[13px] mb-16"
        />
        <p className="text-sm text-black">Abricot 2025</p>
      </div>
    </footer>
  );
}
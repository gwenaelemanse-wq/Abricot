"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { LayoutDashboard, Folder } from "lucide-react";
import { usePathname } from "next/navigation";

export function getInitials(person: { name: string | null; email: string }): string {
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
    const readUserInitials = () => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const user: { name: string | null; email: string } =
            JSON.parse(storedUser);
          setUserInitials(getInitials(user));
        } catch {
          // JSON invalide, on ignore
        }
      }
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    readUserInitials();

    // Le layout ne se démonte pas entre deux pages protégées (ex:
    // /account -> /dashboard), donc l'effet ci-dessus ne se
    // redéclenche pas tout seul. On écoute ce signal, émis par
    // /account après une modification du profil, pour se mettre à
    // jour sans recharger toute la page.
    window.addEventListener("user-updated", readUserInitials);

    return () => {
      window.removeEventListener("user-updated", readUserInitials);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <ProtectedHeader
        pathname={usePathname()}
        userInitials={userInitials}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-20 lg:py-12">
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
    <header className="mx-2 mt-2 bg-white sm:mx-4 sm:mt-4">
      <nav className="flex h-16 items-center justify-between px-3 sm:h-20 sm:px-8 lg:px-20">
        <img
          src="/images/Color=orange.png"
          alt="Logo Abricot"
          className="h-4 w-auto sm:h-5"
        />

        <div className="flex items-center gap-1 sm:gap-4 lg:gap-10">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition sm:gap-3 sm:px-6 sm:py-3 ${
              pathname === "/dashboard"
                ? "bg-neutral-900 text-white"
                : "text-orange-600 hover:bg-orange-50"
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="hidden sm:inline">Tableau de bord</span>
          </Link>

          <Link
            href="/projects"
            className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition sm:gap-3 sm:px-6 sm:py-3 ${
              pathname.startsWith("/projects")
                ? "bg-neutral-900 text-white"
                : "text-orange-700 hover:bg-orange-50"
            }`}
          >
            <Folder size={18} />
            <span className="hidden sm:inline">Projets</span>
          </Link>
        </div>

        <Link
          href="/account"
          className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs sm:ml-0 sm:h-12 sm:w-12 sm:text-sm"
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
      <div className="flex h-12 items-center justify-between px-4 sm:px-8">
        <img
          src="/images/Color=black.png"
          alt="Logo Abricot"
          className="h-3 w-auto"
        />
        <p className="text-sm text-black">Abricot 2025</p>
      </div>
    </footer>
  );
}
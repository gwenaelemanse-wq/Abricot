import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-6 text-center">
      <p className="text-sm font-semibold text-orange-600">Erreur 404</p>

      <h1 className="mt-3 text-3xl font-semibold text-neutral-900">
        Page introuvable
      </h1>

      <p className="mt-3 max-w-md text-sm text-gray-500">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>

      <Link
        href="/dashboard"
        className="mt-8 rounded-md bg-neutral-900 px-6 py-3 text-sm text-white transition hover:bg-neutral-800"
      >
        Retour au tableau de bord
      </Link>
    </main>
  );
}
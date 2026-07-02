"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const response = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Erreur lors de l'inscription");
      setIsLoading(false);
      return;
    }

    const token = data.data.token;
    const user = data.data.user;

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(user));

    setIsLoading(false);

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#d7d7db] p-4 md:p-8">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1360px] overflow-hidden rounded-sm border border-[#2f7fdb] bg-white">
        <div className="flex w-full flex-col bg-[#e4e4e6] px-8 py-6 text-black md:w-[39%] md:px-14 md:py-8">
          <p className="mb-8 text-sm text-[#1275e3]">Sign Up</p>

          <div className="mx-auto mt-3 w-full max-w-[280px]">
            <p className="mb-16 text-center text-[44px] font-black uppercase leading-none tracking-tight text-[#d45a08]">
              Abricot
            </p>
            <h1 className="mb-8 text-5xl font-semibold leading-tight text-[#d45a08]">Inscription</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs text-[#2f2f2f]">
                  Nom
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-10 w-full border border-[#d4d4d4] bg-white px-3 text-sm outline-none transition focus:border-[#9b9b9b]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-xs text-[#2f2f2f]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-10 w-full border border-[#d4d4d4] bg-white px-3 text-sm outline-none transition focus:border-[#9b9b9b]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-xs text-[#2f2f2f]">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 w-full border border-[#d4d4d4] bg-white px-3 text-sm outline-none transition focus:border-[#9b9b9b]"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="h-10 w-full rounded-md bg-[#232327] text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Inscription..." : "S'inscrire"}
              </button>
            </form>

            <p className="mt-28 text-xs text-[#2f2f2f]">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-[#d45a08] underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <div className="relative hidden md:block md:flex-1">
          <Image
            src="/images/backgroundInscr.jpg"
            alt="Bureau avec fournitures"
            fill
            className="object-cover object-right"
            priority
          />
        </div>
      </section>
    </main>
  );
}
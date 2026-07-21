"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
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
      body: JSON.stringify({ email, password }),
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
    <main className="min-h-screen bg-[#d7d7db] p-4 sm:p-8">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1360px] flex-col overflow-hidden rounded-sm border border-[#2f7fdb] bg-white lg:flex-row">
        <div className="order-last flex w-full flex-col bg-white px-6 py-8 text-black sm:px-14 lg:order-first lg:w-[39%]">
          

          <div className="mx-auto flex w-full max-w-[280px] flex-col items-center content-stretch mt-3 lg:m-8">
            <img src="/images/Color=orange.png" alt="Logo Abricot" className="mb-8 h-auto w-[180px] sm:w-[220px]" />
            

            <form onSubmit={handleSubmit} className="w-full max-w-[280px] space-y-5 mt-8 lg:mt-16">
              <h1 className="mb-1 text-4xl sm:text-5xl font-semibold text-center leading-tight text-[#d45a08] mt-4">Inscription</h1>

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

            <p className="mt-12 lg:mt-28 text-xs text-[#2f2f2f]">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-[#d45a08] underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <div className="relative order-first h-40 w-full sm:h-56 lg:order-last lg:h-auto lg:w-auto lg:flex-1">
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
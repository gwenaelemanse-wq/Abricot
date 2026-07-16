"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const response = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Erreur lors de la connexion");
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
    <main className="min-h-screen bg-[#d7d7db] p-8">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1360px] overflow-hidden rounded-sm border border-[#2f7fdb] bg-white">
        <div className="flex w-[39%] flex-col bg-white px-14 py-8 text-black">
          

          <div className="mx-auto flex flex-col items-center content-stretch mt-3 w-full max-w-[280px] m-8">
            <img src="/images/Color=orange.png" alt="LogoOrange" className="mb-8 w-[220px] h-[30px] mb-16" />
            

            <form onSubmit={handleSubmit} className="space-y-5 mt-16 w-[280px] h-[380px]">
              <h1 className="mb-1 text-5xl font-semibold text-center leading-tight text-[#d45a08] mt-4">Connexion</h1>
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
                {isLoading ? "Connexion..." : "Se connecter"}
              </button>

              <button
                type="button"
                onClick={() => setIsForgotPasswordModalOpen(true)}
                className="block w-full text-center text-xs text-[#d45a08] underline"
              >
                Mot de passe oublié?
              </button>
            </form>

            <p className="mt-28 text-xs text-[#2f2f2f]">
              Pas encore de compte ?{" "}
              <Link href="/signin" className="text-[#d45a08] underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        <div className="relative flex-1">
          <Image
            src="/images/backgroundConnexion.jpg"
            alt="Bureau avec fournitures"
            fill
            className="object-cover object-right"
            priority
          />
        </div>
      </section>

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
    </main>
  );
}
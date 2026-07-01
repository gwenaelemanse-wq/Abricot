"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    <main>
      <h1>Connexion</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && <p>{error}</p>}

        <button type="submit" disabled={isLoading}>
        {isLoading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <a href="/signin">Pas encore de compte ? Inscrivez-vous</a>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem("token");

      const response = await fetch("http://localhost:8000/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setUser(data.data.user);
      setFormName(data.data.user.name ?? "");
      setFormEmail(data.data.user.email);
    };

    fetchProfile();
  }, []);

  const updateProfile = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = sessionStorage.getItem("token");

    const response = await fetch("http://localhost:8000/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: formName,
        email: formEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Erreur lors de la mise à jour du profil");
      return;
    }

    setUser(data.data.user);
    setMessage("Profil mis à jour avec succès");
  };

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = sessionStorage.getItem("token");

    const response = await fetch("http://localhost:8000/auth/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Erreur lors du changement de mot de passe");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setMessage("Mot de passe mis à jour avec succès");
  };

  return (
    <main>
      <h1>Mon compte</h1>

      {user ? (
        <>
          <form onSubmit={updateProfile}>
            <label>
              Nom
              <input
                type="text"
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={formEmail}
                onChange={(event) => setFormEmail(event.target.value)}
              />
            </label>

            <button type="submit">Modifier le profil</button>
          </form>

          <form onSubmit={updatePassword}>
            <label>
              Mot de passe actuel
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>

            <label>
              Nouveau mot de passe
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>

            <button type="submit">Modifier le mot de passe</button>
          </form>

          {message && <p>{message}</p>}
        </>
      ) : (
        <p>Chargement du profil...</p>
      )}
    </main>
  );
}
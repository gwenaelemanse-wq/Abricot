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

  useEffect(() => {
  const fetchProfile = async () => {
    const token = sessionStorage.getItem("token");

    const response = await fetch("http://localhost:8000/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    console.log(data);
    setUser(data.data.user);
  };

  fetchProfile();
}, []);

  return (
    <main>
      <h1>Mon compte</h1>

      {user ? (
        <div>
          <p>Nom : {user.name}</p>
          <p>Email : {user.email}</p>
        </div>
      ) : (
        <p>Chargement du profil...</p>
      )}
    </main>
  );
}
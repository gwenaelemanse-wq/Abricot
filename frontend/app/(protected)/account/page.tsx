"use client";

import { useEffect, useState, type FormEvent } from "react";

type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem("token");

      try {
        const response = await fetch(
          "http://localhost:8000/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.message || "Erreur lors du chargement du profil."
          );
          return;
        }

        const fetchedUser: User = data.data.user;

        setUser(fetchedUser);
        setFormEmail(fetchedUser.email);

        const nameParts = fetchedUser.name?.trim().split(/\s+/) ?? [];

        setFirstName(nameParts[0] ?? "");
        setLastName(nameParts.slice(1).join(" "));
      } catch {
        setMessage("Erreur réseau lors du chargement du profil.");
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateAccount = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setMessage("");

    const token = sessionStorage.getItem("token");

    if (!firstName.trim() || !lastName.trim() || !formEmail.trim()) {
      setMessage("Le prénom, le nom et l’adresse email sont obligatoires.");
      return;
    }

    

    try {
      setIsUpdating(true);

      const completeName = `${firstName.trim()} ${lastName.trim()}`;

      const profileResponse = await fetch(
        "http://localhost:8000/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: completeName,
            email: formEmail.trim(),
          }),
        }
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        setMessage(
          profileData.message ||
            "Erreur lors de la mise à jour du profil."
        );
        return;
      }

      setUser(profileData.data.user);// Modifier le mot de passe uniquement si un nouveau est renseigné
      if (newPassword.trim()) {
        if (!currentPassword.trim()) {
          setMessage("Saisissez votre mot de passe actuel.");
          return;
        }

        await fetch("/auth/password", {
          method: "PUT",
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        });
      }

     

      setCurrentPassword("");
      setNewPassword("");

      setMessage("Informations mises à jour avec succès.");
    } catch {
      setMessage("Erreur réseau lors de la mise à jour du compte.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <section className="mx-auto w-full max-w-5xl rounded-lg border border-gray-200 bg-white px-10 py-8">
        {user ? (
          <>
            <div className="mb-8">
              <h1 className="text-lg font-medium text-neutral-900">
                Mon compte
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {user.name || "Utilisateur"}
              </p>
            </div>

            <form
              onSubmit={handleUpdateAccount}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="last-name"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Nom
                </label>

                <input
                  id="last-name"
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none transition focus:border-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor="first-name"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Prénom
                </label>

                <input
                  id="first-name"
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none transition focus:border-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor="account-email"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Email
                </label>

                <input
                  id="account-email"
                  type="email"
                  value={formEmail}
                  onChange={(event) =>
                    setFormEmail(event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none transition focus:border-orange-500"
                />
              </div>

              <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium text-neutral-900"
              >
                Mot de passe
              </label>

              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="••••••••••"
                autoComplete="new-password"
                className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
              />
            </div>
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Nouveau mot de passe
                </label>

                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  placeholder="Laisser vide pour ne pas le modifier"
                  autoComplete="new-password"
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none transition focus:border-orange-500"
                />
              </div>

              {newPassword && (
              <div>
                <label
                  htmlFor="current-password"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Mot de passe actuel
                </label>

                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
                />
              </div>
            )}

              {message && (
                <p
                  className={`rounded-md p-3 text-sm ${
                    message.includes("succès")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isUpdating}
                className="rounded-md bg-neutral-900 px-6 py-3 text-sm text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating
                  ? "Modification..."
                  : "Modifier les informations"}
              </button>
            </form>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Chargement du profil...
          </p>
        )}
      </section>
    </main>
  );
}
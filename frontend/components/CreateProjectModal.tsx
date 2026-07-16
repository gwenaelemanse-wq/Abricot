"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

type Member = {
  id: string;
  role: "OWNER" | "ADMIN" | "CONTRIBUTOR";
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  ownerId: string;
  members: Member[];
};

type UserOption = {
  id: string;
  name: string | null;
  email: string;
};

type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProject: Project) => void;
};

export default function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserOption[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [error, setError] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Recherche progressive (min. 2 caractères), avec debounce.
  useEffect(() => {
    if (!isOpen || searchQuery.trim().length < 2) {
      return;
    }

    const searchUsers = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Utilisateur non authentifié.");
        return;
      }

      try {
        setIsSearchingUsers(true);

        const response = await fetch(
          `http://localhost:8000/users/search?query=${encodeURIComponent(
            searchQuery.trim()
          )}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Erreur lors de la recherche des utilisateurs."
          );
          setSearchResults([]);
          return;
        }

        setSearchResults(data.data.users ?? []);
        setIsDropdownOpen(true);
      } catch {
        setError("Erreur réseau lors de la recherche des utilisateurs.");
        setSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    };

    const timeoutId = window.setTimeout(searchUsers, 300);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen, searchQuery]);

  // Ferme le menu déroulant si on clique en dehors.
  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const isSelected = (userId: string) =>
    selectedUsers.some((user) => user.id === userId);

  // Sélectionner/désélectionner ne ferme PAS le menu : on peut
  // cocher plusieurs personnes à la suite sur la même recherche.
  const toggleUser = (user: UserOption) => {
    setSelectedUsers((previousUsers) =>
      isSelected(user.id)
        ? previousUsers.filter((selected) => selected.id !== user.id)
        : [...previousUsers, user]
    );
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((previousUsers) =>
      previousUsers.filter((user) => user.id !== userId)
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);
    setIsDropdownOpen(false);
    setError("");
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  const handleCreateProject = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Vous devez renseigner le nom du projet.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      setError("Utilisateur non authentifié.");
      return;
    }

    try {
      setIsCreatingProject(true);

      const response = await fetch("http://localhost:8000/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          contributors: selectedUsers.map((user) => user.email),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Erreur lors de la création du projet.");
        return;
      }

      onProjectCreated(data.data.project);
      closeModal();
    } catch {
      setError("Erreur réseau lors de la création du projet.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  // En dessous de 2 caractères, on n'affiche jamais de résultats,
  // même si searchResults contient encore d'anciens résultats.
  const displayedResults =
    searchQuery.trim().length < 2 ? [] : searchResults;

  const dropdownLabel =
    selectedUsers.length === 0
      ? "Choisir un ou plusieurs collaborateurs"
      : `${selectedUsers.length} collaborateur${
          selectedUsers.length > 1 ? "s" : ""
        }`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-16">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        className="relative w-full max-w-md rounded-lg bg-white px-10 py-8 shadow-lg"
      >
        <button
          type="button"
          onClick={closeModal}
          aria-label="Fermer la fenêtre"
          className="absolute right-5 top-4 text-xl text-gray-500 transition hover:text-gray-700"
        >
          ×
        </button>

        <h2
          id="create-project-title"
          className="text-xl font-semibold text-neutral-900"
        >
          Créer un projet
        </h2>

        <form onSubmit={handleCreateProject} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="project-name"
              className="mb-2 block text-sm font-medium text-neutral-900"
            >
              Titre*
            </label>

            <input
              id="project-name"
              type="text"
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none transition focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="mb-2 block text-sm font-medium text-neutral-900"
            >
              Description*
            </label>

            <textarea
              id="project-description"
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-200 p-3 text-sm outline-none transition focus:border-orange-500"
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <label
              htmlFor="contributors-search"
              className="mb-2 block text-sm font-medium text-neutral-900"
            >
              Contributeurs
            </label>

            <input
              id="contributors-search"
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setError("");
              }}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setIsDropdownOpen(true);
                }
              }}
              placeholder={
                selectedUsers.length > 0
                  ? dropdownLabel
                  : "Rechercher un collaborateur (min. 2 caractères)"
              }
              autoComplete="off"
              role="combobox"
              aria-expanded={isDropdownOpen}
              aria-controls="contributors-results"
              className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none transition focus:border-orange-500"
            />

            {isSearchingUsers && (
              <p className="mt-2 text-xs text-gray-600">Recherche...</p>
            )}

            {isDropdownOpen && displayedResults.length > 0 && (
              <div
                id="contributors-results"
                role="listbox"
                aria-multiselectable="true"
                className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
              >
                {displayedResults.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected(user.id)}
                    onClick={() => toggleUser(user)}
                    className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-orange-50"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected(user.id)}
                      readOnly
                      tabIndex={-1}
                      className="pointer-events-none h-4 w-4 rounded border-gray-300 text-orange-600"
                    />

                    <span>
                      <span className="block text-sm font-medium text-neutral-900">
                        {user.name || "Utilisateur"}
                      </span>

                      <span className="mt-0.5 block text-xs text-gray-600">
                        {user.email}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.trim().length === 1 && (
              <p className="mt-2 text-xs text-gray-600">
                Saisissez au moins deux caractères.
              </p>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-900">
                Membres sélectionnés
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 rounded-full bg-orange-100 px-3 py-2 text-sm text-orange-800"
                  >
                    <span>{user.name || user.email}</span>

                    <button
                      type="button"
                      onClick={() => removeSelectedUser(user.id)}
                      aria-label={`Retirer ${user.name || user.email}`}
                      className="font-semibold text-orange-800 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={
                !name.trim() || !description.trim() || isCreatingProject
              }
              className="rounded-md bg-neutral-900 px-6 py-3 text-sm text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              {isCreatingProject ? "Création..." : "Ajouter un projet"}
            </button>

            <button
              type="button"
              onClick={closeModal}
              className="rounded-md border border-gray-200 px-6 py-3 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
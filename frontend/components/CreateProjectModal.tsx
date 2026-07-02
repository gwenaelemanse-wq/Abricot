"use client";

import { useState } from "react";

type Member = {
  id: string;
  role: "OWNER" | "ADMIN" | "CONTRIBUTOR";
  user: {
    id: string;
    name: string;
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
  const [error, setError] = useState("");

  const handleCreateProject = async (
    event: React.FormEvent<HTMLFormElement>
  ) => { 
      event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Vous devez renseigner le nom du projet.");
    return;
    }


    const token = sessionStorage.getItem("token");

    const response = await fetch("http://localhost:8000/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
        contributors: [],
      }),
    });

    const data = await response.json();

    console.log(data);

    onProjectCreated(data.data.project);

    onClose();

    setName("");
    setDescription("");

  };

  if (!isOpen) {
    return null;
  }

  return (
    <form onSubmit={handleCreateProject}>
      <label htmlFor="name">Nom du projet</label>

      <input
        id="name"        
        type="text"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setError("");
        }}
      />

      {error && <p>{error}</p>}
      
      <label htmlFor="description">Description</label>

      <textarea
        id="description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <button type="submit">
        Créer un projet
      </button>

      <button type="button" onClick={onClose}>
        Annuler
      </button>

    </form>
  );
}
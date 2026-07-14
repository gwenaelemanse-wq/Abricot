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

type EditProjectModalProps = {
    project: Project;
    onProjectUpdated: (updatedProject: Project) => void;
}

export default function EditProjectModal({ project, onProjectUpdated }: EditProjectModalProps) {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || "");
    const [error, setError] = useState("");
    const [editAssigneeId, setEditAssigneeId] = useState<string | null>(
    project.members?.[0]?.user.id ?? null
    );
    const handleUpdateProject = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setError("");

        if (!name.trim()) {
            setError("Vous devez renseigner le nom du projet.");
            return;
        }

        const token = sessionStorage.getItem("token");

        const response = await fetch(`http://localhost:8000/projects/${project.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, description, editAssigneeId })
        });

        const data = await response.json();

        onProjectUpdated(data.data.project);

    };

      return (
    <form onSubmit={handleUpdateProject}>
      <label htmlFor={`edit-name-${project.id}`}>Nom du projet</label>
      <input
        id={`edit-name-${project.id}`}
        type="text"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setEditAssigneeId(null);
          setError("");
        }}
      />

      {error && <p>{error}</p>}

      <label htmlFor={`edit-description-${project.id}`}>Description</label>
      <textarea
        id={`edit-description-${project.id}`}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <button type="submit">Enregistrer</button>
    </form>
  );
}
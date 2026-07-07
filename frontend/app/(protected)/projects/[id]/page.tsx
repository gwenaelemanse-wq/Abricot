"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Project = {
  id: string;
  name: string;
  description: string | null;
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      const token = sessionStorage.getItem("token");

      const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setProject(data.data.project);
    };

    fetchProject();
  }, [projectId]);

  if (!project) {
    return <p>Chargement du projet...</p>;
  }

  return (
    <main>
      <section className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {project.description}
          </p>
        </div>

        <button className="rounded-md bg-neutral-900 px-5 py-3 text-sm text-white">
          Créer une tâche
        </button>
      </section>

      <section className="mt-8 rounded-xl bg-white p-8 shadow-sm">
        <h2 className="text-lg font-medium">Tâches</h2>
        <p className="mt-2 text-sm text-gray-500">
          Ici on affichera les tâches du projet.
        </p>
      </section>
    </main>
  );
}

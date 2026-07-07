"use client";

import { useEffect, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import CreateProjectModal from "@/components/CreateProjectModal";

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  ownerId: string;
  members: {
    id: string;
    role: "OWNER" | "ADMIN" | "CONTRIBUTOR";
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [projectName, setProjectName] = useState("");
const [projectDescription, setProjectDescription] = useState("");
const [error, setError] = useState("");
const [contributorsInput, setContributorsInput] = useState("");


  useEffect(() => {
    const fetchProjects = async () => {
      const token = sessionStorage.getItem("token");

      const response = await fetch("http://localhost:8000/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log(data);
      setProjects(data.data.projects);
    };

    fetchProjects();
  }, []);

  

  const handleDeleteProject = async (projectId: string) => {
    const token = sessionStorage.getItem("token");

    const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setProjects((previousProjects) =>
        previousProjects.filter((project) => project.id !== projectId)
      );
    }
  };

const handleCreateProject = async (event: React.FormEvent) => {
  event.preventDefault();

  const token = sessionStorage.getItem("token");

  const contributors = contributorsInput
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

  const response = await fetch("http://localhost:8000/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: projectName,
      description: projectDescription,
      contributors,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    setError(data.message || "Erreur lors de la création du projet");
    return;
  }

  setProjects((previousProjects) => [
    data.data.project,
    ...previousProjects,
  ]);

  setProjectName("");
  setProjectDescription("");
  setContributorsInput("");
  setError("");
  setIsCreateModalOpen(false);
};

  return (
    <main>
      <section className="mb-8 flex items-start justify-between">
  <div>
    <h1 className="text-2xl font-semibold text-neutral-900">
      Mes projets
    </h1>

    <p className="mt-2 text-sm text-gray-600">
      Gérer vos projets
    </p>
  </div>

  <button
    onClick={() => setIsCreateModalOpen(true)}
    className="rounded-md bg-neutral-900 px-5 py-3 text-sm text-white transition hover:bg-neutral-800"
  >
    + Créer un projet
  </button>
</section>
       {isCreateModalOpen && (
  <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-16">
    <div className="relative w-full max-w-md rounded-lg bg-white px-12 py-10 shadow-sm">
      


      

      <form onSubmit={handleCreateProject} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-900">
            Titre*
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-900">
            Description*
          </label>
          <input
            type="text"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
          />
        </div>

        
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-900">
            Contributeurs
          </label>
         <input
    type="text"
    value={contributorsInput}
    onChange={(e) => setContributorsInput(e.target.value)}
    placeholder="email1@test.com, email2@test.com"
    className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
  />

  <p className="mt-1 text-xs text-gray-400">
    Sépare les emails par des virgules.
  </p>

  
        </div>

        <button
          type="submit"
          disabled={!projectName || !projectDescription}
          className="mt-6 rounded-md bg-gray-200 px-6 py-3 text-sm text-gray-400"
        >
          Ajouter un projet
        </button>
      </form>
    </div>
  </div>
)}       
     

     

      {projects.length === 0 ? (
        <p>Aucun projet pour le moment.</p>
      ) : (
        
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  {projects.map((project) => (
    <ProjectCard key={project.id} project={project} />
  ))}
</div>
        
      )}
    </main>
  );
}
"use client";

import { useCallback, useEffect, useState } from "react";

import ProjectCard from "@/components/ProjectCard";
import CreateProjectModal from "@/components/CreateProjectModal";

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELLED";

type ProjectTask = {
  id: string;
  status: TaskStatus;
};

type ProjectMember = {
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
  updatedAt?: string;
  ownerId: string;

  owner?: {
    id: string;
    name: string | null;
    email: string;
  };

  members: ProjectMember[];

  _count?: {
    tasks: number;
  };

  userRole?: "OWNER" | "ADMIN" | "CONTRIBUTOR";

  tasks?: ProjectTask[];
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setError("");

    try {
      setIsLoading(true);

      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Utilisateur non authentifié.");
        return;
      }

      const response = await fetch(
        "http://localhost:8000/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Erreur lors de la récupération des projets."
        );
        return;
      }

      const receivedProjects: Project[] =
        data.data.projects ?? [];

      const projectsWithTasks = await Promise.all(
        receivedProjects.map(async (project) => {
          try {
            const tasksResponse = await fetch(
              `http://localhost:8000/projects/${project.id}/tasks`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const tasksData = await tasksResponse.json();

            if (!tasksResponse.ok) {
              return {
                ...project,
                tasks: [],
              };
            }

            return {
              ...project,
              tasks: tasksData.data.tasks ?? [],
            };
          } catch {
            return {
              ...project,
              tasks: [],
            };
          }
        })
      );

      setProjects(projectsWithTasks);
    } catch {
      setError(
        "Erreur réseau lors de la récupération des projets."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Chargement initial des projets depuis le backend : cas d'usage
    // standard d'un effet (synchronisation avec une source externe
    // au montage). fetchProjects met à jour l'état en interne.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  return (
    <main>
      <section className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Mes projets
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Gérez vos projets et suivez leur progression.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-md bg-neutral-900 px-5 py-3 text-sm text-white transition hover:bg-neutral-800"
        >
          + Créer un projet
        </button>
      </section>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <section className="mt-8">
        {isLoading ? (
          <p className="text-sm text-gray-500">
            Chargement des projets...
          </p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun projet disponible.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
        )}
      </section>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={() => {
          setIsCreateModalOpen(false);
          fetchProjects();
        }}
      />
    </main>
  );
}
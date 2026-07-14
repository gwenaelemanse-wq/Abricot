"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import ProjectCard from "@/components/ProjectCard";

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

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] =
    useState("");
  const [contributorsInput, setContributorsInput] =
    useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingProject, setIsCreatingProject] =
    useState(false);

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
    fetchProjects();
  }, [fetchProjects]);

  const resetCreateProjectForm = () => {
    setProjectName("");
    setProjectDescription("");
    setContributorsInput("");
    setError("");
  };

  const closeCreateProjectModal = () => {
    resetCreateProjectForm();
    setIsCreateModalOpen(false);
  };

  const handleCreateProject = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!projectName.trim()) {
      setError("Le nom du projet est obligatoire.");
      return;
    }

    try {
      setIsCreatingProject(true);

      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Utilisateur non authentifié.");
        return;
      }

      const contributors = contributorsInput
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      const response = await fetch(
        "http://localhost:8000/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: projectName.trim(),
            description: projectDescription.trim(),
            contributors,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Erreur lors de la création du projet."
        );
        return;
      }

      closeCreateProjectModal();

      // On recharge tous les projets afin de récupérer aussi
      // leurs tâches et leurs progressions.
      await fetchProjects();
    } catch {
      setError(
        "Erreur réseau lors de la création du projet."
      );
    } finally {
      setIsCreatingProject(false);
    }
  };

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

      {error && !isCreateModalOpen && (
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

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-16">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
            className="relative w-full max-w-md rounded-lg bg-white px-10 py-8 shadow-lg"
          >
            <button
              type="button"
              onClick={closeCreateProjectModal}
              aria-label="Fermer la fenêtre"
              className="absolute right-5 top-4 text-xl text-gray-400 hover:text-gray-600"
            >
              ×
            </button>

            <h2
              id="create-project-title"
              className="text-xl font-semibold text-neutral-900"
            >
              Créer un projet
            </h2>

            <form
              onSubmit={handleCreateProject}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="project-name"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Nom du projet*
                </label>

                <input
                  id="project-name"
                  type="text"
                  required
                  value={projectName}
                  onChange={(event) =>
                    setProjectName(event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor="project-description"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Description
                </label>

                <input
                  id="project-description"
                  type="text"
                  value={projectDescription}
                  onChange={(event) =>
                    setProjectDescription(event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor="project-contributors"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Contributeurs
                </label>

                <input
                  id="project-contributors"
                  type="text"
                  value={contributorsInput}
                  onChange={(event) =>
                    setContributorsInput(event.target.value)
                  }
                  placeholder="email1@test.com, email2@test.com"
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              {error && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  !projectName.trim() ||
                  isCreatingProject
                }
                className="rounded-md bg-neutral-900 px-6 py-3 text-sm text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                {isCreatingProject
                  ? "Création..."
                  : "Ajouter un projet"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
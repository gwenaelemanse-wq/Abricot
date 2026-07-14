"use client";

import { useEffect, useState, type FormEvent } from "react";
import TaskCard from "@/components/TaskCard";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  projectId: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
  };
  comments?: {
    id: string;
  }[];
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<"list" | "kanban">("list");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [contributorsInput, setContributorsInput] = useState("");
  const [error, setError] = useState("");

  const todoTasks = tasks.filter((task) => task.status === "TODO");

  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  );

  const doneTasks = tasks.filter((task) => task.status === "DONE");

  useEffect(() => {
    const fetchAssignedTasks = async () => {
      const token = sessionStorage.getItem("token");

      try {
        const response = await fetch(
          "http://localhost:8000/dashboard/assigned-tasks",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Erreur lors de la récupération des tâches."
          );
          return;
        }

        setTasks(data.data.tasks);
      } catch {
        setError("Erreur réseau lors de la récupération des tâches.");
      }
    };

    fetchAssignedTasks();
  }, []);

  const handleTaskDeleted = (taskId: string) => {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== taskId)
    );
  };

  const handleCreateProject = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const token = sessionStorage.getItem("token");

    const contributors = contributorsInput
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    try {
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
        setError(
          data.message || "Erreur lors de la création du projet."
        );
        return;
      }

      setProjectName("");
      setProjectDescription("");
      setContributorsInput("");
      setError("");
      setIsCreateModalOpen(false);
    } catch {
      setError("Erreur réseau lors de la création du projet.");
    }
  };

  return (
    <main>
      <section className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>

          <p className="mt-2 text-sm text-gray-600">
            Bonjour Alice Dupont, voici un aperçu de vos projets et tâches
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-md bg-neutral-900 px-5 py-3 text-sm text-white"
        >
          + Créer un projet
        </button>
      </section>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => setView("list")}
          className={`rounded-md px-4 py-2 text-sm transition ${
            view === "list"
              ? "bg-orange-100 text-orange-600"
              : "bg-white text-gray-500"
          }`}
        >
          Liste
        </button>

        <button
          type="button"
          onClick={() => setView("kanban")}
          className={`rounded-md px-4 py-2 text-sm transition ${
            view === "kanban"
              ? "bg-orange-100 text-orange-600"
              : "bg-white text-gray-500"
          }`}
        >
          Kanban
        </button>
      </div>

      

      {error && (
        <p className="mt-4 text-sm text-red-500">
          {error}
        </p>
      )}

      {view === "list" && (
        <div className="mt-6 space-y-4">
          <section className="mt-6 rounded-xl bg-white p-10 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-medium">Mes tâches assignées</h2>

            <p className="mt-1 text-sm text-gray-500">
              Par ordre de priorité
            </p>
          </div>

          <input
            type="search"
            placeholder="Rechercher une tâche"
            aria-label="Rechercher une tâche"
            className="w-72 rounded-md border border-gray-200 px-4 py-3 text-sm"
          />
        </div>
      </section>
          {tasks.length === 0 ? 
            <p className="text-sm text-gray-500">
              Aucune tâche assignée.
            </p>
           : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant="List"
                canDelete={true}
                onDeleted={handleTaskDeleted}
              />
            ))
          )}
        </div>
      )}

      {view === "kanban" && (
        <section className="mt-6 grid grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              À faire{" "}
              <span className="rounded-full bg-gray-200 px-2 text-xs">
                {todoTasks.length}
              </span>
            </h3>

            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant="Kanban"
                canDelete={true}
                onDeleted={handleTaskDeleted}
              />
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              En cours{" "}
              <span className="rounded-full bg-gray-200 px-2 text-xs">
                {inProgressTasks.length}
              </span>
            </h3>

            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant="Kanban"
                canDelete={true}
                onDeleted={handleTaskDeleted}
              />
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              Terminées{" "}
              <span className="rounded-full bg-gray-200 px-2 text-xs">
                {doneTasks.length}
              </span>
            </h3>

            {doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant="Kanban"
                canDelete={true}
                onDeleted={handleTaskDeleted}
              />
            ))}
          </div>
        </section>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-16">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
            className="relative w-full max-w-md rounded-lg bg-white px-12 py-10 shadow-sm"
          >
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              aria-label="Fermer la fenêtre"
              className="absolute right-6 top-5 text-xl text-gray-400 hover:text-gray-600"
            >
              ×
            </button>

            <h2
              id="create-project-title"
              className="mb-8 text-xl font-medium text-neutral-900"
            >
              Créer un projet
            </h2>

            <form
              onSubmit={handleCreateProject}
              className="space-y-5"
            >
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
                  Description*
                </label>

                <input
                  id="project-description"
                  type="text"
                  required
                  value={projectDescription}
                  onChange={(event) =>
                    setProjectDescription(event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor="contributors"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Contributeurs
                </label>

                <input
                  id="contributors"
                  type="text"
                  value={contributorsInput}
                  onChange={(event) =>
                    setContributorsInput(event.target.value)
                  }
                  placeholder="email1@test.com, email2@test.com"
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={!projectName || !projectDescription}
                className="mt-6 rounded-md bg-neutral-900 px-6 py-3 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                Ajouter un projet
              </button>
            </form>
          </div>
        </div>
      )}

      <Link href="/logout" className="mt-8 inline-block text-sm">
        Se déconnecter
      </Link>
    </main>
  );
}
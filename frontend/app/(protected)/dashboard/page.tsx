"use client";

import { useEffect, useState } from "react";
import TaskCard from "@/components/TaskCard";
import CreateProjectModal from "@/components/CreateProjectModal";
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
  const [userName, setUserName] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState("");

  // "Aujourd'hui" une seule fois, pour comparer le mois/année de
  // chaque tâche avec le mois/année actuels.
  const today = new Date();

  const kanbanTasks = tasks.filter((task) => {
    // Pas de date d'échéance -> toujours visible dans le Kanban,
    // sinon la personne assignée ne la verrait plus nulle part
    // sur son tableau de bord.
    if (!task.dueDate) {
      return true;
    }

    const dueDate = new Date(task.dueDate);

    return (
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  });

  const todoTasks = kanbanTasks.filter((task) => task.status === "TODO");

  const inProgressTasks = kanbanTasks.filter(
    (task) => task.status === "IN_PROGRESS"
  );

  const doneTasks = kanbanTasks.filter((task) => task.status === "DONE");

  useEffect(() => {
    // L'utilisateur a été stocké dans sessionStorage au moment du
    // login (voir login/page.tsx). Pas besoin d'un nouvel appel API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser: { name: string | null; email: string } =
          JSON.parse(storedUser);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserName(parsedUser.name || parsedUser.email);
      } catch {
        // Ignoré : si le JSON est invalide, on garde userName à null.
      }
    }
  }, []);

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

  return (
    <main>
      <section className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>

          <p className="mt-2 text-sm text-gray-600">
            Bonjour {userName ?? "..."}, voici un aperçu de vos projets et tâches
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full rounded-md bg-neutral-900 px-5 py-3 text-sm text-white sm:w-auto"
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
              ? "bg-orange-100 text-orange-800"
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
              ? "bg-orange-100 text-orange-800"
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
          <section className="mt-6 rounded-xl bg-white p-5 shadow-sm sm:p-10">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between">
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
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm sm:w-72"
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
        <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={() => {
          setIsCreateModalOpen(false);
        }}
      />

      <Link href="/logout" className="mt-8 inline-block text-sm">
        Se déconnecter
      </Link>
    </main>
  );
}
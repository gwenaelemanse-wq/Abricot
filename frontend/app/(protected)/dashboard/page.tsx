"use client";

import { useEffect, useState } from "react";
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
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const todoTasks = tasks.filter((task) => task.status === "TODO");
  const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((task) => task.status === "DONE");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
const [projectDescription, setProjectDescription] = useState("");
const [error, setError] = useState("");
const [contributorsInput, setContributorsInput] = useState("");

useEffect(() => {
  const fetchAssignedTasks = async () => {
    const token = sessionStorage.getItem("token");

    const response = await fetch(
      "http://localhost:8000/dashboard/assigned-tasks",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    setTasks(data.data.tasks);
  };

  fetchAssignedTasks();
}, []);

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

  setProjectName("");
  setProjectDescription("");
  setError("");
  setIsCreateModalOpen(false);
  setContributorsInput("");
};

  return (
    <main>
      <h1>Tableau de bord</h1>

      <section className="flex items-start justify-between">
  <div>
    <h1 className="text-2xl font-semibold">Tableau de bord</h1>
    <p className="mt-2 text-sm text-gray-600">
      Bonjour Alice Dupont, voici un aperçu de vos projets et tâches
    </p>
  </div>

<button
  onClick={() => setIsCreateModalOpen(true)}
  className="rounded-md bg-neutral-900 px-5 py-3 text-sm text-white"
>
  + Créer un projet
</button>
</section>

       <div className="mt-8 flex gap-3">

  <button
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

        <section className="mt-6 rounded-xl bg-white p-10 shadow-sm">
  <div className="flex items-start justify-between">
    <div>
      <h2 className="text-lg font-medium">Mes tâches assignées</h2>
      <p className="mt-1 text-sm text-gray-500">Par ordre de priorité</p>
    </div>

    <input
      type="text"
      placeholder="Rechercher une tâche"
      className="w-72 rounded-md border border-gray-200 px-4 py-3 text-sm"
    />
  </div>
</section>
{view === "list" && (
  <div className="mt-6 space-y-4">
    {tasks.length === 0 ? (
      <p className="text-sm text-gray-500">Aucune tâche assignée.</p>
    ) : (
      tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))
    )}
  </div>
)}
        {view === "kanban" && (
  <section className="mt-6 grid grid-cols-3 gap-6">
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">
        À faire <span className="rounded-full bg-gray-200 px-2 text-xs">{todoTasks.length}</span>
      </h3>

      {todoTasks.map((task) => (
        <TaskCard key={task.id} task={task} variant="kanban" />
      ))}
    </div>

    <div className="space-y-4">
      <h3 className="text-sm font-semibold">
        En cours <span className="rounded-full bg-gray-200 px-2 text-xs">{inProgressTasks.length}</span>
      </h3>

      {inProgressTasks.map((task) => (
        <TaskCard key={task.id} task={task} variant="kanban" />
      ))}
    </div>

    <div className="space-y-4">
      <h3 className="text-sm font-semibold">
        Terminées <span className="rounded-full bg-gray-200 px-2 text-xs">{doneTasks.length}</span>
      </h3>

      {doneTasks.map((task) => (
        <TaskCard key={task.id} task={task} variant="kanban" />
      ))}
    </div>
  </section>
)}

  {isCreateModalOpen && (
  <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-16">
    <div className="relative w-full max-w-md rounded-lg bg-white px-12 py-10 shadow-sm">
      <button
        type="button"
        onClick={() => setIsCreateModalOpen(false)}
        className="absolute right-6 top-5 text-xl text-gray-400 hover:text-gray-600"
      >
        ×
      </button>

      <h2 className="mb-8 text-xl font-medium text-neutral-900">
        Créer un projet
      </h2>

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
        <Link href="/account">Mon compte</Link>
        <Link href="/projects">Mes projets</Link>
        <Link href="/logout">Se déconnecter</Link>
    </main>
  );
}
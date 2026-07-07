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

      console.log(data);
      setTasks(data.data.tasks);
    };

    fetchAssignedTasks();
  }, []);

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

<button onClick={() => setIsCreateModalOpen(true)}>
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
  <p>Vue Liste</p>
)}
        {view === "kanban" && (
            <section>
            <h2>Kanban</h2>

            <div>
                <div>
                    <h3>À faire</h3>
                        {todoTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>

                <div>
                    <h3>En cours</h3>
                        {inProgressTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>

                <div>
                    <h3>Terminé</h3>
                        {doneTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            </div>
            </section>
   )}

   {isCreateModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-lg">
      <h2 className="text-xl font-semibold">Créer un projet</h2>

      {/* Ton formulaire viendra ici */}

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setIsCreateModalOpen(false)}
          className="rounded-md bg-gray-200 px-4 py-2"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
)}
            
        <Link href="/account">Mon compte</Link>
        <Link href="/projects">Mes projets</Link>
        <Link href="/logout">Se déconnecter</Link>
    </main>
  );
}
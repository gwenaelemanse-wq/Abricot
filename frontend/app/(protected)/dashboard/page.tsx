"use client";

import { useEffect, useState } from "react";
import TaskCard from "@/components/TaskCard";

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

        <button type="button" onClick={() => setView("list")}>
        Liste
        </button>

        <button type="button" onClick={() => setView("kanban")}>
        Kanban
        </button>

        {view === "list" && (
            <section>
            <h2>Liste des tâches</h2>

            {tasks.length === 0 ? (
            <p>Aucune tâche assignée.</p>
            ) : (
                <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                    <TaskCard task={task} />
                    </li>
                ))}
                </ul>
            )}
            </section>
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
        
    </main>
  );
}
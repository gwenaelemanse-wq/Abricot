"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProjectTaskCard from "@/components/ProjectTaskCard";


type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  projectId: string;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  tasks: Task[];
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

const [taskTitle, setTaskTitle] = useState("");
const [taskDescription, setTaskDescription] = useState("");
const [taskPriority, setTaskPriority] = useState<
  "LOW" | "MEDIUM" | "HIGH" | "URGENT"
>("MEDIUM");
const [taskDueDate, setTaskDueDate] = useState("");
const [taskError, setTaskError] = useState("");
const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchProject = async () => {
      const token = sessionStorage.getItem("token");

      const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const tasksResponse = await fetch(
  `http://localhost:8000/projects/${projectId}/tasks`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const tasksData = await tasksResponse.json();
setTasks(tasksData.data.tasks);

      const data = await response.json();
      setProject(data.data.project);
    };

    fetchProject();

  }, [projectId]);

  if (!project) {
    return <p>Chargement du projet...</p>;
  }


  const handleCreateTask = async (event: React.FormEvent) => {
  event.preventDefault();

  const token = sessionStorage.getItem("token");

  const response = await fetch(
    `http://localhost:8000/projects/${projectId}/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        assigneeIds: [],
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
  setTaskError(data.message || "Erreur lors de la création de la tâche");
  return;
}

setProject((previousProject) => {
  if (!previousProject) return previousProject;

  return {
    ...previousProject,
    tasks: [data.data.task, ...previousProject.tasks],
  };
});

setTaskTitle("");
setTaskDescription("");
setTaskPriority("MEDIUM");
setTaskDueDate("");
setTaskError("");
setIsCreateTaskModalOpen(false);
};

  return (
    <main>
      <section className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {project.description}
          </p>
        </div>

       <button
  onClick={() => setIsCreateTaskModalOpen(true)}
  className="rounded-md bg-neutral-900 px-5 py-3 text-sm text-white"
>
  Créer une tâche
</button>
      </section>

      <section className="mt-8 rounded-xl bg-white p-8 shadow-sm">
  <div className="mb-6 flex items-start justify-between">
    <div>
      <h2 className="text-lg font-medium">Tâches</h2>
      <p className="mt-1 text-sm text-gray-500">Par ordre de priorité</p>
    </div>

    <input
      type="text"
      placeholder="Rechercher une tâche"
      className="w-72 rounded-md border border-gray-200 px-4 py-3 text-sm"
    />
  </div>

  <div className="space-y-4">
    {tasks.length === 0 ? (
      <p className="text-sm text-gray-500">Aucune tâche pour ce projet.</p>
    ) : (
      tasks.map((task) => (
  <ProjectTaskCard key={task.id} task={task} variant="List" />
))
    )}
  </div>
</section>

{isCreateTaskModalOpen && (
  <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-16">
    <div className="relative w-full max-w-md rounded-lg bg-white px-12 py-10 shadow-sm">
      <button
        type="button"
        onClick={() => setIsCreateTaskModalOpen(false)}
        className="absolute right-6 top-5 text-xl text-gray-400 hover:text-gray-600"
      >
        ×
      </button>

      <h2 className="mb-8 text-xl font-medium text-neutral-900">
        Créer une tâche
      </h2>

      <form onSubmit={handleCreateTask} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-900">
            Titre*
          </label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-900">
            Description
          </label>
          <input
            type="text"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-900">
            Priorité
          </label>
          <select
            value={taskPriority}
            onChange={(e) =>
              setTaskPriority(
                e.target.value as "LOW" | "MEDIUM" | "HIGH" | "URGENT"
              )
            }
            className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
          >
            <option value="LOW">Basse</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="HIGH">Haute</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-900">
            Échéance
          </label>
          <input
            type="date"
            value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
            className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
          />
        </div>

        {taskError && <p className="text-sm text-red-500">{taskError}</p>}

        <button
          type="submit"
          disabled={!taskTitle}
          className="mt-6 rounded-md bg-neutral-900 px-6 py-3 text-sm text-white disabled:bg-gray-200 disabled:text-gray-400"
        >
          Ajouter une tâche
        </button>
      </form>
    </div>
  </div>
)}
    </main>
  );
}

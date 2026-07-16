"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useParams } from "next/navigation";
import ProjectTaskCard from "@/components/ProjectTaskCard";
import EditModalProject from "@/components/EditModalProject";

type Comment = {
  id: string;
  content: string;
  createdAt?: string;
  author?: {
    id: string;
    name: string | null;
    email: string;
  };
};

type Assignee = {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type ProjectMember = {
  id: string;
  role: "OWNER" | "ADMIN" | "CONTRIBUTOR";
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  joinedAt?: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

  dueDate: string | null;
  projectId: string;
  comments?: Comment[];
  assignees?: Assignee[];
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  tasks: Task[];
  members: ProjectMember[];
  createdAt: string;
  ownerId: string;
};

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// Décode le payload d'un JWT côté client, sans dépendance externe.
// À usage d'affichage uniquement : la vraie vérification des droits
// se fait côté backend.
function getCurrentUserId(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId ?? payload.id ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] =
    useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] =
    useState<TaskPriority>("MEDIUM");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("TODO");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssigneeId, setTaskAssigneeId] =
    useState<string | null>(null);

  const [taskError, setTaskError] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    // sessionStorage n'est pas disponible côté serveur : on ne peut
    // lire l'utilisateur connecté qu'après le montage, côté client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const token = sessionStorage.getItem("token");
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentUserId(getCurrentUserId(token));
    }
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      const token = sessionStorage.getItem("token");

      try {
        const [projectResponse, tasksResponse] = await Promise.all([
          fetch(`http://localhost:8000/projects/${projectId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(
            `http://localhost:8000/projects/${projectId}/tasks`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        const projectData = await projectResponse.json();
        const tasksData = await tasksResponse.json();

        if (!projectResponse.ok) {
          throw new Error(
            projectData.message || "Impossible de récupérer le projet."
          );
        }

        if (!tasksResponse.ok) {
          throw new Error(
            tasksData.message || "Impossible de récupérer les tâches."
          );
        }

        setProject(projectData.data.project);
        setTasks(tasksData.data.tasks);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du projet :",
          error
        );
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleTaskDeleted = (taskId: string) => {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== taskId)
    );
  };

  const resetCreateTaskForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("MEDIUM");
    setTaskStatus("TODO");
    setTaskDueDate("");
    setTaskAssigneeId(null);
    setTaskError("");
  };

  const closeCreateTaskModal = () => {
    resetCreateTaskForm();
    setIsCreateTaskModalOpen(false);
  };

  const handleCreateTask = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setTaskError("");

    if (!taskTitle.trim()) {
      setTaskError("Le titre est obligatoire.");
      return;
    }

    try {
      setIsCreatingTask(true);

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
            title: taskTitle.trim(),
            description: taskDescription.trim(),
            priority: taskPriority,
            status: taskStatus,
            dueDate: taskDueDate || undefined,
            assigneeIds: taskAssigneeId
              ? [taskAssigneeId]
              : [],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setTaskError(
          data.message || "Erreur lors de la création de la tâche."
        );
        return;
      }

      setTasks((previousTasks) => [
        data.data.task,
        ...previousTasks,
      ]);

      closeCreateTaskModal();
    } catch {
      setTaskError(
        "Erreur réseau lors de la création de la tâche."
      );
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const handleProjectUpdated = (
    updatedProject: Omit<Project, "tasks">
  ) => {
    setProject((previousProject) =>
      previousProject
        ? { ...previousProject, ...updatedProject }
        : previousProject
    );
    setEditModalOpen(false);
  };

  if (!project) {
    return <p>Chargement du projet...</p>;
  }

  // Seul le créateur (owner) du projet peut le modifier.
  const canManageProject = currentUserId === project.ownerId;

  // Le owner correspond au membre dont le rôle est OWNER
  // (il n'existe pas de champ project.owner séparé).
  const ownerMember = project.members.find(
    (member) => member.role === "OWNER"
  );

  // Le owner + les admins + les contributeurs peuvent gérer les tâches.
  const currentUserMember = project.members.find(
    (member) => member.user.id === currentUserId
  );

  const canManageTasks =
    currentUserId === project.ownerId ||
    currentUserMember?.role === "ADMIN" ||
    currentUserMember?.role === "CONTRIBUTOR";

  return (
    <main>
      <section className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{project.name}</h1>

            {canManageProject && (
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="text-left underline px-5 py-3 text-sm text-orange-500"
              >
                Modifier
              </button>
            )}
          </div>

          <p className="mt-2 text-sm text-gray-500">
            {project.description || "Aucune description"}
          </p>
        </div>

        {canManageTasks && (
          <button
            type="button"
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="rounded-md bg-neutral-900 px-5 py-3 text-sm text-white"
          >
            + Créer une tâche
          </button>
        )}
      </section>

      <section className="mt-8 rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-medium">Tâches</h2>

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

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucune tâche pour ce projet.
            </p>
          ) : (
            tasks.map((task) => (
              <ProjectTaskCard
                key={task.id}
                task={task}
                owner={
                  ownerMember?.user ?? {
                    id: project.ownerId,
                    name: null,
                    email: "",
                  }
                }
                members={project.members}
                variant="List"
                canDelete={canManageTasks}
                onDeleted={handleTaskDeleted}
                onUpdated={handleTaskUpdated}
              />
            ))
          )}
        </div>
      </section>

      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-16">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-task-title"
            className="relative w-full max-w-md rounded-lg bg-white px-12 py-10 shadow-sm"
          >
            <button
              type="button"
              onClick={closeCreateTaskModal}
              aria-label="Fermer la fenêtre"
              className="absolute right-6 top-5 text-xl text-gray-400 hover:text-gray-600"
            >
              ×
            </button>

            <h2
              id="create-task-title"
              className="mb-8 text-xl font-medium text-neutral-900"
            >
              Créer une tâche
            </h2>

            <form
              onSubmit={handleCreateTask}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Titre*
                </label>

                <input
                  id="task-title"
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(event) =>
                    setTaskTitle(event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor="task-description"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Description
                </label>

                <input
                  id="task-description"
                  type="text"
                  value={taskDescription}
                  onChange={(event) =>
                    setTaskDescription(event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor="task-due-date"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Échéance
                </label>

                <input
                  id="task-due-date"
                  type="date"
                  value={taskDueDate}
                  onChange={(event) =>
                    setTaskDueDate(event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor="task-assignee"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Assigné à
                </label>

                <select
                  id="task-assignee"
                  value={taskAssigneeId ?? ""}
                  onChange={(event) =>
                    setTaskAssigneeId(
                      event.target.value || null
                    )
                  }
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
                >
                  <option value="">Choisir un membre</option>

                  {project.members.map((member) => (
                    <option
                      key={member.id}
                      value={member.user.id}
                    >
                      {member.user.name || member.user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-neutral-900">
                  Statut
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTaskStatus("TODO")}
                    aria-pressed={taskStatus === "TODO"}
                    className={`rounded-full px-3 py-1 text-xs ${
                      taskStatus === "TODO"
                        ? "bg-red-100 text-red-500 ring-2 ring-red-200"
                        : "bg-red-50 text-red-400"
                    }`}
                  >
                    À faire
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setTaskStatus("IN_PROGRESS")
                    }
                    aria-pressed={
                      taskStatus === "IN_PROGRESS"
                    }
                    className={`rounded-full px-3 py-1 text-xs ${
                      taskStatus === "IN_PROGRESS"
                        ? "bg-orange-100 text-orange-500 ring-2 ring-orange-200"
                        : "bg-orange-50 text-orange-400"
                    }`}
                  >
                    En cours
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskStatus("DONE")}
                    aria-pressed={taskStatus === "DONE"}
                    className={`rounded-full px-3 py-1 text-xs ${
                      taskStatus === "DONE"
                        ? "bg-green-100 text-green-600 ring-2 ring-green-200"
                        : "bg-green-50 text-green-500"
                    }`}
                  >
                    Terminée
                  </button>
                </div>
              </div>

              {taskError && (
                <p className="text-sm text-red-500">
                  {taskError}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  !taskTitle.trim() || isCreatingTask
                }
                className="mt-6 rounded-md bg-neutral-900 px-6 py-3 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                {isCreatingTask
                  ? "Ajout..."
                  : "Ajouter une tâche"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <EditModalProject
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          project={project}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
    </main>
  );
}
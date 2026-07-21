"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProjectTaskCard from "@/components/ProjectTaskCard";
import EditModalProject from "@/components/EditModalProject";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";

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

// Génère des initiales (2 lettres max) à partir du nom, ou de
// l'email à défaut.
function getInitials(user: {
  name: string | null;
  email: string;
}): string {
  if (user.name && user.name.trim().length > 0) {
    const parts = user.name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  return user.email.slice(0, 2).toUpperCase();
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
  const [taskAssigneeIds, setTaskAssigneeIds] = useState<string[]>([]);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] =
    useState(false);

  const [taskError, setTaskError] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const [taskViewMode, setTaskViewMode] = useState<"list" | "calendar">(
    "list"
  );
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED"
  >("ALL");

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
    setTaskAssigneeIds([]);
    setIsAssigneeDropdownOpen(false);
    setTaskError("");
  };

  const closeCreateTaskModal = () => {
    resetCreateTaskForm();
    setIsCreateTaskModalOpen(false);
  };

  const createTaskModalRef = useModalAccessibility(
    isCreateTaskModalOpen,
    closeCreateTaskModal
  );

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
            assigneeIds: taskAssigneeIds,
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

  // Le owner correspond au membre dont l'id correspond à
  // project.ownerId (plus fiable que de se fier au champ role,
  // qui peut ne pas contenir exactement "OWNER" selon le backend).
  const ownerMember = project.members.find(
    (member) => member.user.id === project.ownerId
  );

  // Le owner + les admins + les contributeurs peuvent gérer les tâches.
  const currentUserMember = project.members.find(
    (member) => member.user.id === currentUserId
  );

  const canManageTasks =
    currentUserId === project.ownerId ||
    currentUserMember?.role === "ADMIN" ||
    currentUserMember?.role === "CONTRIBUTOR";

  // Tri par échéance la plus proche d'abord ; les tâches sans date
  // sont reléguées à la fin (elles ne sont pas "urgentes").
  const sortedTasks = [...tasks].sort((taskA, taskB) => {
    if (!taskA.dueDate && !taskB.dueDate) {
      return 0;
    }
    if (!taskA.dueDate) {
      return 1;
    }
    if (!taskB.dueDate) {
      return -1;
    }
    return (
      new Date(taskA.dueDate).getTime() -
      new Date(taskB.dueDate).getTime()
    );
  });

  const filteredTasks =
    statusFilter === "ALL"
      ? sortedTasks
      : sortedTasks.filter((task) => task.status === statusFilter);

  const statusFilterLabels: Record<typeof statusFilter, string> = {
    ALL: "Tous les statuts",
    TODO: "À faire",
    IN_PROGRESS: "En cours",
    DONE: "Terminée",
    CANCELLED: "Annulée",
  };

  return (
    <main>
      <section className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/projects"
            aria-label="Retour aux projets"
            className="mt-1 text-gray-500 transition hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

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

      <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-100 px-6 py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-neutral-900">
            Contributeurs
          </span>

          <span className="text-sm text-gray-500">
            {project.members.length} personne
            {project.members.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {project.members.map((member) => {
            const isOwner = member.user.id === project.ownerId;

            return (
              <div
                key={member.id}
                className={`flex items-center gap-2 rounded-full px-2 py-1 ${
                  isOwner ? "bg-white" : "bg-gray-200"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                    isOwner
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {getInitials(member.user)}
                </span>

                <span
                  className={`text-xs ${
                    isOwner
                      ? "font-medium text-orange-600"
                      : "text-gray-700"
                  }`}
                >
                  {isOwner
                    ? "Propriétaire"
                    : member.user.name || member.user.email}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium">Tâches</h2>

            <p className="mt-1 text-sm text-gray-500">
              Par ordre de priorité
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTaskViewMode("list")}
                aria-pressed={taskViewMode === "list"}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition ${
                  taskViewMode === "list"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-white text-gray-500 border border-gray-200"
                }`}
              >
                Liste
              </button>

              <button
                type="button"
                onClick={() => setTaskViewMode("calendar")}
                aria-pressed={taskViewMode === "calendar"}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition ${
                  taskViewMode === "calendar"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-white text-gray-500 border border-gray-200"
                }`}
              >
                Calendrier
              </button>
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as typeof statusFilter
                )
              }
              aria-label="Filtrer par statut"
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
            >
              {(
                Object.keys(statusFilterLabels) as Array<
                  typeof statusFilter
                >
              ).map((status) => (
                <option key={status} value={status}>
                  {statusFilterLabels[status]}
                </option>
              ))}
            </select>

            <input
              type="search"
              placeholder="Rechercher une tâche"
              aria-label="Rechercher une tâche"
              className="w-72 rounded-md border border-gray-200 px-4 py-3 text-sm"
            />
          </div>
        </div>

        {taskViewMode === "calendar" ? (
          <div className="rounded-md border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
            Vue calendrier disponible prochainement.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <p className="text-sm text-gray-500">
                {tasks.length === 0
                  ? "Aucune tâche pour ce projet."
                  : "Aucune tâche ne correspond à ce statut."}
              </p>
            ) : (
              filteredTasks.map((task) => (
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
        )}
      </section>

      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-16">
          <div
            ref={createTaskModalRef}
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

              <div className="relative">
                <label
                  id="task-assignee-label"
                  className="mb-2 block text-sm font-medium text-neutral-900"
                >
                  Assigné à
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setIsAssigneeDropdownOpen(
                      (previousValue) => !previousValue
                    )
                  }
                  aria-haspopup="listbox"
                  aria-expanded={isAssigneeDropdownOpen}
                  aria-labelledby="task-assignee-label"
                  className="flex h-11 w-full items-center justify-between rounded-md border border-gray-200 px-3 text-left text-sm outline-none focus:border-orange-500"
                >
                  <span
                    className={
                      taskAssigneeIds.length === 0
                        ? "text-gray-400"
                        : "text-neutral-900"
                    }
                  >
                    {taskAssigneeIds.length === 0
                      ? "Choisir un ou plusieurs membres"
                      : `${taskAssigneeIds.length} membre${
                          taskAssigneeIds.length > 1 ? "s" : ""
                        } assigné${
                          taskAssigneeIds.length > 1 ? "s" : ""
                        }`}
                  </span>

                  <span
                    className={`text-gray-400 transition-transform ${
                      isAssigneeDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    ⌄
                  </span>
                </button>

                {isAssigneeDropdownOpen && (
                  <div
                    role="listbox"
                    aria-multiselectable="true"
                    className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
                  >
                    {project.members.map((member) => {
                      const isSelected = taskAssigneeIds.includes(
                        member.user.id
                      );

                      return (
                        <button
                          key={member.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() =>
                            setTaskAssigneeIds((previousIds) =>
                              isSelected
                                ? previousIds.filter(
                                    (id) => id !== member.user.id
                                  )
                                : [...previousIds, member.user.id]
                            )
                          }
                          className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left text-sm transition last:border-b-0 hover:bg-orange-50"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            tabIndex={-1}
                            className="pointer-events-none h-4 w-4 rounded border-gray-300 text-orange-600"
                          />

                          {member.user.name || member.user.email}
                        </button>
                      );
                    })}
                  </div>
                )}
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
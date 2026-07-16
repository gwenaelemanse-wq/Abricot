"use client";

import { useState, type FormEvent } from "react";

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

type ProjectTaskCardProps = {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
    projectId: string;
    dueDate: string | null;
    comments?: Comment[];
    assignees?: Assignee[];
  };
    owner: {
    id: string;
    name: string | null;
    email: string;
  };

  members: {
    id: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }[];
  variant?: "List" | "Kanban";
  canDelete: boolean;
  onDeleted: (taskId: string) => void;
  onUpdated: (updatedTask: ProjectTaskCardProps["task"]) => void;
};

export default function ProjectTaskCard({
  task,
  variant = "List",
    owner,
  members,
  canDelete,
  onDeleted,
  onUpdated,
}: ProjectTaskCardProps) {
  const [comments, setComments] = useState<Comment[]>(task.comments ?? []);
  const [createComment, setCreateComment] = useState("");
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description ?? "");
  const [editStatus, setEditStatus] = useState(task.status);
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ? task.dueDate.slice(0, 10) : ""
  );
  const [editAssigneeId, setEditAssigneeId] =  useState<string | null>(null);
  const [editError, setEditError] = useState ("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const badge = {
    TODO: "À faire",
    IN_PROGRESS: "En cours",
    DONE: "Terminée",
    CANCELLED: "Annulée",
  };

  const badgeColor = {
    TODO: "bg-red-100 text-red-500",
    IN_PROGRESS: "bg-orange-100 text-orange-500",
    DONE: "bg-green-100 text-green-600",
    CANCELLED: "bg-gray-200 text-gray-500",
  };

  const handleCreateComment = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!createComment.trim()) {
      setError("Le commentaire ne peut pas être vide.");
      return;
    }

    try {
      setIsCreatingComment(true);

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8000/projects/${task.projectId}/tasks/${task.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: createComment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Erreur lors de la création du commentaire."
        );
        return;
      }

      setComments((previousComments) => [
        ...previousComments,
        data.data.comment,
      ]);

      setCreateComment("");
    } catch {
      setError("Erreur réseau lors de la création du commentaire.");
    } finally {
      setIsCreatingComment(false);
    }
  };

  const handleDeleteTask = async () => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette tâche ?"
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      setIsDeleting(true);

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8000/projects/${task.projectId}/tasks/${task.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Erreur lors de la suppression de la tâche."
        );
        return;
      }

      onDeleted(task.id);
    } catch {
      setError("Erreur réseau lors de la suppression de la tâche.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateTask = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();
  setEditError("");

  try {
    setIsSavingEdit(true);

    const token = sessionStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8000/projects/${task.projectId}/tasks/${task.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          status: editStatus,
          dueDate: editDueDate || null,
          assigneeIds: editAssigneeId ? [editAssigneeId] : [],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setEditError(
        data.message || "Erreur lors de la modification de la tâche."
      );
      return;
    }

    onUpdated(data.data.task);
    setIsEditModalOpen(false);
  } catch {
    setEditError("Erreur réseau lors de la modification de la tâche.");
  } finally {
    setIsSavingEdit(false);
  }
};

  return (
    <article
      className={`rounded-lg border border-gray-200 bg-white p-6 transition hover:shadow-sm ${
        variant === "List" ? "w-full" : "w-full"
      }`}
      
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {task.title}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {task.description || "Aucune description"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              badgeColor[task.status]
            }`}
          >
            {badge[task.status]}
          </span>

          {canDelete && (
            <button
              type="button"
              onClick={handleDeleteTask}
              disabled={isDeleting}
              className="rounded-md bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </button>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((previousValue) => !previousValue)}
            aria-label="Ouvrir le menu de la tâche"
            aria-expanded={isMenuOpen}
            className="rounded-md px-2 py-1 text-xl text-gray-500 hover:bg-gray-100"
          >
            ⋯
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
              >
                Modifier la tâche
              </button>

              <button
                type="button"
                className="block w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>

      </div>

      <div className="mt-6 flex flex-wrap items-center gap-5 text-xs text-gray-400">
        <span>
          👤{" "}
          {task.assignees && task.assignees.length > 0
            ? task.assignees
                .map(
                  (assignee) =>
                    assignee.user.name || assignee.user.email
                )
                .join(", ")
            : "Aucun assigné"}
        </span>

        <span>
          📅{" "}
          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>

        <button
          type="button"
          onClick={() => setIsOpen((previousValue) => !previousValue)}
          className="text-xs text-gray-500 transition hover:text-orange-600"
          aria-expanded={isOpen}
        >
          💬 {comments.length} commentaire
          {comments.length > 1 ? "s" : ""}
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500">
          {error}
        </p>
      )}

      {isOpen && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aucun commentaire.
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-md bg-gray-50 p-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium text-neutral-800">
                      {comment.author?.name ||
                        comment.author?.email ||
                        "Utilisateur"}
                    </p>

                    {comment.createdAt && (
                      <time className="text-xs text-gray-400">
                        {new Date(
                          comment.createdAt
                        ).toLocaleDateString("fr-FR")}
                      </time>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-gray-600">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleCreateComment}
            className="mt-4 space-y-3"
          >
            <label
              htmlFor={`comment-${task.id}`}
              className="sr-only"
            >
              Ajouter un commentaire
            </label>

            <textarea
              id={`comment-${task.id}`}
              value={createComment}
              onChange={(event) =>
                setCreateComment(event.target.value)
              }
              placeholder="Écrire un commentaire..."
              className="w-full rounded-md border border-gray-200 p-3 text-sm outline-none focus:border-orange-400"
              rows={3}
            />

            <button
              type="submit"
              disabled={
                isCreatingComment || !createComment.trim()
              }
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingComment ? "Envoi..." : "Envoyer"}
            </button>
          </form>
        </div>
      )}

      {isEditModalOpen && (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-16">
        <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(false)}
            className="absolute right-5 top-4 text-xl text-gray-400 hover:text-gray-600"
            aria-label="Fermer la fenêtre"
          >
            ×
          </button>

      <h2 className="text-xl font-semibold">
        Modifier la tâche
      </h2>

      <form
        onSubmit={handleUpdateTask}
        className="mt-6 space-y-5"
      >
        <div>
          <label
            htmlFor={`edit-title-${task.id}`}
            className="mb-2 block text-sm font-medium text-neutral-900"
          >
            Titre
          </label>

          <input
            id={`edit-title-${task.id}`}
            type="text"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label
            htmlFor={`edit-description-${task.id}`}
            className="mb-2 block text-sm font-medium text-neutral-900"
          >
            Description
          </label>

          <input
            id={`edit-description-${task.id}`}
            type="text"
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
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
                  value={editDueDate}
                  onChange={(event) =>
                    setEditDueDate(event.target.value)
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
                  value={editAssigneeId ?? ""}
                  onChange={(event) =>
                    setEditAssigneeId(
                      event.target.value || null
                    )
                  }
                  className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-orange-500"
                >
                  <option value="">Choisir un membre</option>

                  <option value={owner.id}>
                    {owner.name || owner.email}
                  </option>

                  {members.map((member) => (
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
                    onClick={() => setEditStatus("TODO")}
                    aria-pressed={editStatus === "TODO"}
                    className={`rounded-full px-3 py-1 text-xs ${
                      editStatus === "TODO"
                        ? "bg-red-100 text-red-500 ring-2 ring-red-200"
                        : "bg-red-50 text-red-400"
                    }`}
                  >
                    À faire
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditStatus("IN_PROGRESS")
                    }
                    aria-pressed={
                      editStatus === "IN_PROGRESS"
                    }
                    className={`rounded-full px-3 py-1 text-xs ${
                      editStatus === "IN_PROGRESS"
                        ? "bg-orange-100 text-orange-500 ring-2 ring-orange-200"
                        : "bg-orange-50 text-orange-400"
                    }`}
                  >
                    En cours
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus("DONE")}
                    aria-pressed={editStatus === "DONE"}
                    className={`rounded-full px-3 py-1 text-xs ${
                      editStatus === "DONE"
                        ? "bg-green-100 text-green-600 ring-2 ring-green-200"
                        : "bg-green-50 text-green-500"
                    }`}
                  >
                    Terminée
                  </button>
                </div>
              </div>

              {editError && (
                <p className="text-sm text-red-500">
                  {editError}
                </p>
              )}

        <button
          type="submit"
          disabled={isSavingEdit}
          className="rounded-md bg-neutral-900 px-5 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSavingEdit ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  </div>
)}
    </article>
  );
}
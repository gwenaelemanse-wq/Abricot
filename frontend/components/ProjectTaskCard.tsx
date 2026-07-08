"use client";

import { useState } from "react";

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

type ProjectTaskCardProps = {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
    projectId: string;
    dueDate: string | null;
    comments?: Comment[];
    assignees?: {
      id: string;
      user: {
        id: string;
        name: string | null;
        email: string;
      };
    }[];
  };
  variant?: "List" | "Kanban";
};

export default function ProjectTaskCard({
  task,
  variant = "List",
}: ProjectTaskCardProps) {
  const [comments, setComments] = useState<Comment[]>(task.comments ?? []);
  const [createComment, setCreateComment] = useState("");
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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

  const handleCreateComment = async (event: React.FormEvent) => {
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
            content: createComment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Erreur lors de la création du commentaire");
        return;
      }

      setComments((prev) => [...prev, data.data.comment]);
      setCreateComment("");
    } catch (error) {
      setError("Erreur réseau lors de la création du commentaire.");
    } finally {
      setIsCreatingComment(false);
    }
  };

  return (
    <article
      className={`rounded-lg border border-gray-200 bg-white p-6 transition hover:shadow-sm ${
        variant === "List" ? "w-full" : "w-full"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {task.title}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {task.description || "Aucune description"}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${badgeColor[task.status]}`}
        >
          {badge[task.status]}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-5 text-xs text-gray-400">
          <span>
            👤{" "}
            {task.assignees && task.assignees.length > 0
              ? task.assignees
                  .map((assignee) => assignee.user.name || assignee.user.email)
                  .join(", ")
              : "Aucun assigné"}
          </span>

          <span>
            📅{" "}
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })
              : "-"}
          </span>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-xs text-gray-500 transition hover:text-orange-600"
          >
            💬 {comments.length} commentaire{comments.length > 1 ? "s" : ""}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun commentaire.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-md bg-gray-50 p-3">
                  <p className="text-sm font-medium text-neutral-800">
                    {comment.author?.name || comment.author?.email || "Utilisateur"}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleCreateComment} className="mt-4 space-y-3">
            <textarea
              value={createComment}
              onChange={(event) => setCreateComment(event.target.value)}
              placeholder="Écrire un commentaire..."
              className="w-full rounded-md border border-gray-200 p-3 text-sm outline-none focus:border-orange-400"
              rows={3}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isCreatingComment}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {isCreatingComment ? "Envoi..." : "Envoyer"}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
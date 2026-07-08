import Link from "next/link";

type TaskCardProps = {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
    project?: {
      id: string;
      name: string;
    };
    dueDate: string | null;
    comments?: { id: string }[];
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  
    
  };

  variant?: "List" | "Kanban";
};

export default function TaskCard({ task, variant = "List" }: TaskCardProps) {
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
        <div className="flex items-center gap-5 text-xs text-gray-400">
          <span>📁 {task.project?.name ?? "Nom du projet"}</span>

          <span>
            📅{" "}
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })
              : "-"}
          </span>

          <span>💬 {task.comments?.length ?? 0}</span>
        </div>

        <Link
  href={`/projects/${task.project?.id}`}
  className="rounded-md bg-neutral-900 px-7 py-3 text-sm text-white transition hover:bg-neutral-800"
>
  Voir
</Link>
      </div>
    </article>
  );
}
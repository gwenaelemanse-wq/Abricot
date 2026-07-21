import Link from "next/link";

type Member = {
  id: string;
  role: "OWNER" | "ADMIN" | "CONTRIBUTOR";
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  ownerId: string;
  members: Member[];
  _count?: {
    tasks: number;
  };
  userRole?: "OWNER" | "ADMIN" | "CONTRIBUTOR";
  tasks?: {
    id: string;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  }[];
};

type ProjectCardProps = {
  project: Project;
};

// Génère des initiales (2 lettres max) à partir du nom, ou de
// l'email à défaut.
function getInitials(person: { name: string | null; email: string }): string {
  if (person.name && person.name.trim().length > 0) {
    return person.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  return person.email.slice(0, 2).toUpperCase();
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const members = project.members ?? [];
  const tasks = project.tasks ?? [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "DONE"
  ).length;
  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  // Le propriétaire est le membre dont l'id correspond à
  // project.ownerId (pas de champ project.owner séparé).
  const ownerMember = members.find(
    (member) => member.user.id === project.ownerId
  );

  // Les autres membres à afficher (sans le propriétaire, déjà
  // affiché séparément avec son badge "Propriétaire").
  const otherMembers = members.filter(
    (member) => member.user.id !== project.ownerId
  );

  return (
    <Link href={`/projects/${project.id}`}>
      <article className="w-80 cursor-pointer rounded-lg bg-white p-7 shadow-sm transition hover:shadow-md">
        <h3 className="text-lg font-semibold text-neutral-900">
          {project.name}
        </h3>

        <p className="mt-2 min-h-10 text-sm text-gray-500">
          {project.description || "Aucune description"}
        </p>

        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">Progression</span>
            <span className="text-sm font-medium text-neutral-900">
              {progress}%
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-orange-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            {completedTasks}/{totalTasks} tâches terminées
          </p>
        </div>

        <div className="mt-8 flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Équipe ({members.length})
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {ownerMember && (
            <>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs text-orange-700">
                {getInitials(ownerMember.user)}
              </span>

              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700">
                Propriétaire
              </span>
            </>
          )}

          {otherMembers.slice(0, 2).map((member) => (
            <span
              key={member.user.id}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600"
            >
              {getInitials(member.user)}
            </span>
          ))}
        </div>
      </article>
    </Link>
  );
}
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
};

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const members = project.members ?? [];
  const taskCount = project._count?.tasks ?? 0;

  return (
    <Link href={`/projects/${project.id}`}>
    <article className="w-80 cursor-pointer rounded-lg bg-white p-7 shadow-sm transition hover:shadow-md">
    
      <h3 className="text-lg font-semibold text-neutral-900">
        {project.name}
      </h3>

      <p className="mt-2 min-h-10 text-sm text-gray-500">
        {project.description || "Aucune description"}
      </p>

      <div className="mt-8 flex items-center justify-between text-xs text-gray-500">
        <span>Progression</span>
        <span>0%</span>
      </div>

      <div className="mt-2 h-2 rounded-full bg-gray-200">
        <div className="h-2 w-0 rounded-full bg-orange-500" />
      </div>

      <p className="mt-2 text-xs text-gray-500">
        0/{taskCount} tâches terminées
      </p>

      <div className="mt-8 flex items-center gap-2">
        <span className="text-xs text-gray-500">
          Équipe ({members.length})
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs text-orange-700">
          AD
        </span>

        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700">
          Propriétaire
        </span>

        {members.slice(0, 2).map((member) => (
          <span
            key={member.user.id}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600"
          >
            {(member.user.name || member.user.email).slice(0, 2).toUpperCase()}
          </span>
        ))}
      </div>
    </article>
    </Link>
  );
}
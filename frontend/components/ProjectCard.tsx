import { useState } from "react";
import EditProjectModal from "@/components/EditModalProject";
import Link from "next/link";



type Member = {
  id: string;
  role: "OWNER" | "ADMIN" | "CONTRIBUTOR";
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  members: Member[];
  ownerId: string;
};

type ProjectCardProps = {
  project: Project;
  onDelete: (projectId: string) => void;
  onProjectUpdated: (updatedProject: Project) => void;
};




export default function ProjectCard({ project, onDelete, onProjectUpdated }: ProjectCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");

  const currentMember = project.members.find(
  (member) => member.user.id === currentUser.id
  );

  const role = currentMember?.role;

  const isOwner = project.ownerId === currentUser.id;
const canEdit = isOwner || role === "OWNER" || role === "ADMIN";
const canDelete = isOwner || role === "OWNER";

  console.log("Utilisateur connecté :", currentUser);
console.log("Membres du projet :", project.members);
console.log("Membre trouvé :", currentMember);
console.log("Rôle :", role);

  return (
    <article>
      <h2>{project.name}</h2>
      <p>{project.description || "Aucune description"}</p>
      {canEdit && (
  <button type="button" onClick={() => setIsEditOpen(true)}>
    Modifier
  </button>
)}

{canDelete && (
  <button type="button" onClick={() => onDelete(project.id)}>
    Supprimer
  </button>
)}

      {isEditOpen && (
      <EditProjectModal
       project={project}
      onProjectUpdated={(updatedProject) => {
      onProjectUpdated(updatedProject);
      setIsEditOpen(false);
      }}
      />
    )}

      <Link href={`/projects/${project.id}`}>
      Voir le projet
      </Link>

    
    </article>
  );
}
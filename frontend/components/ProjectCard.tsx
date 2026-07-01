import { useState } from "react";
import EditProjectModal from "@/components/EditModalProject";


type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

type ProjectCardProps = {
  project: Project;
  onDelete: (projectId: string) => void;
  onProjectUpdated: (updatedProject: Project) => void;
};




export default function ProjectCard({ project, onDelete, onProjectUpdated }: ProjectCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <article>
      <h2>{project.name}</h2>
      <p>{project.description || "Aucune description"}</p>
      <button onClick={() => onDelete(project.id)}>Supprimer</button>
      <button type="button" onClick={() => setIsEditOpen(true)}>
         Modifier
      </button>

      {isEditOpen && (
      <EditProjectModal
       project={project}
      onProjectUpdated={(updatedProject) => {
      onProjectUpdated(updatedProject);
      setIsEditOpen(false);
    }}
  />
)}
    </article>
  );
}
"use client";

import { useEffect, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import CreateProjectModal from "@/components/CreateProjectModal";

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = sessionStorage.getItem("token");

      const response = await fetch("http://localhost:8000/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log(data);
      setProjects(data.data.projects);
    };

    fetchProjects();
  }, []);

  const handleProjectCreated = (newProject: Project) => {
    setProjects((previousProjects) => [...previousProjects, newProject]);
  };

  const handleDeleteProject = async (projectId: string) => {
    const token = sessionStorage.getItem("token");

    const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setProjects((previousProjects) =>
        previousProjects.filter((project) => project.id !== projectId)
      );
    }
  };

  const handleProjectUpdated = (updatedProject: Project) => {
  setProjects((previousProjects) =>
    previousProjects.map((project) =>
      project.id === updatedProject.id ? updatedProject : project
    )
  );
};

  return (
    <main>
      <h1>Mes projets</h1>

      <button onClick={() => setIsCreateModalOpen(true)}>
  + Créer un projet
</button>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

     

      {projects.length === 0 ? (
        <p>Aucun projet pour le moment.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} onDelete={handleDeleteProject} onProjectUpdated={handleProjectUpdated} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
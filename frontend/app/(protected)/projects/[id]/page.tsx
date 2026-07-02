"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TaskCard from "@/components/TaskCard";

  type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
};


export default function ProjectDetailPage() {
  const params = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
  const fetchTasks = async () => {
    const token = sessionStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8000/projects/${params.id}/tasks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log(data);

    setTasks(data.data.tasks);
  };

  fetchTasks();
}, [params.id]);



  console.log(params);

  return (
  <main>
    <h1>Projet</h1>

    {tasks.length === 0 ? (
      <p>Aucune tâche.</p>
    ) : (
      tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))
    )}
  </main>
  )

}


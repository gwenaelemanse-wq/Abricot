type Task = {
    id: string;
    title: string;
    description: string | null;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate: string | null;
}

type TaskCardProps = {
    task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
    return (
        <div>
            <h2>{task.title}</h2>
            <p>{task.description || "Aucune description"}</p>
            <p>Status: {task.status}</p>
            <p>Priority: {task.priority}</p>
            {task.dueDate && <p>Échéance : {task.dueDate}</p>}
        </div>
    );
}

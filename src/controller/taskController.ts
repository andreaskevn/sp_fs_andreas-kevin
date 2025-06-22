import type { Task } from "./projectController"; 

export interface NewTaskData {
  title: string;
  description?: string;
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
  assigneeId?: string | null; 
}

interface ControllerResponse {
  success: boolean;
  data?: Task;
  error?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  status?: "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
  order?: number;
  assigneeId?: string | null;
}

export async function createTask(
  projectId: string,
  taskData: NewTaskData
): Promise<ControllerResponse> {
  const token = localStorage.getItem("auth_token");
  if (!token) return { success: false, error: "Sesi tidak valid." };

  try {
    const response = await fetch(`/api/projects/${projectId}/task`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal membuat task");
    }

    const newTask: Task = await response.json();
    return { success: true, data: newTask };
  } catch (error: any) {
    console.error("Create task error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTask(
  projectId: string,
  taskId: string,
  taskData: UpdateTaskData
): Promise<ControllerResponse> {
  const token = localStorage.getItem("auth_token");
  if (!token) return { success: false, error: "Sesi tidak valid." };

  try {
    const response = await fetch(`/api/projects/${projectId}/task/${taskId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal mengupdate task");
    }

    const updatedTask: Task = await response.json();
    return { success: true, data: updatedTask };
  } catch (error: any) {
    console.error("Update task error:", error);
    return { success: false, error: error.message };
  }
}

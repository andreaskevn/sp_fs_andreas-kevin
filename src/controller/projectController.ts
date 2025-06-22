export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  order: number;
  assignee: {
    user: {
      email: string;
      id: string;
    };
  } | null;
}

export interface Project {
  id: string;
  name: string;
  owner: {
    id: string;
    email: string;
  };
  members: {
    id: string;
    user: {
      id: string;
      email: string;
    };
  }[];
  _count: {
    members: number;
    tasks: number;
  };
  tasks?: Task[];
}

interface ProjectsListResponse {
  success: boolean;
  data?: Project[]; 
  error?: string;
}

interface SingleProjectResponse {
  success: boolean;
  data?: Project; 
  error?: string;
  status?: number;
}

export async function fetchProjectById(
  projectId: string
): Promise<SingleProjectResponse> {
  const token = localStorage.getItem("auth_token");
  if (!token) return { success: false, error: "Sesi tidak valid." };
  if (!projectId) return { success: false, error: "ID Proyek dibutuhkan." };
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetching project with ID:", projectId);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal mengambil data proyek");
    }
    const data: Project = await response.json();
    console.log("Fetched project data:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("Fetch project by id error:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchProjects(): Promise<ProjectsListResponse> {
  const token = localStorage.getItem("auth_token");
  if (!token) return { success: false, error: "Sesi tidak valid." };

  try {
    const response = await fetch(`/api/projects`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal mengambil daftar proyek");
    }

    const data: Project[] = await response.json();
    return { success: true, data: data };
  } catch (error: any) {
    console.error("Fetch projects list error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * @param name 
 * @returns 
 */
export async function createProject(
  name: string
): Promise<SingleProjectResponse> {
  const token = localStorage.getItem("auth_token");
  if (!token) return { success: false, error: "Sesi tidak valid." };

  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal membuat proyek");
    }

    const data: Project = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Create project error:", error);
    return { success: false, error: error.message };
  }
}

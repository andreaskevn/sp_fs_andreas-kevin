
export interface TaskCounts {
  BACKLOG: number;
  TODO: number;
  IN_PROGRESS: number;
  DONE: number;
}

export interface AnalyticData {
  projectId: string;
  projectName: string;
  taskCounts: TaskCounts;
}

interface ControllerResponse {
  success: boolean;
  data?: AnalyticData[];
  error?: string;
}

export async function fetchAnalytics(): Promise<ControllerResponse> {
  const token = localStorage.getItem("auth_token");
  if (!token) return { success: false, error: "Sesi tidak valid." };

  try {
    const response = await fetch("/api/analytic", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal mengambil data analitik");
    }

    const data: AnalyticData[] = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

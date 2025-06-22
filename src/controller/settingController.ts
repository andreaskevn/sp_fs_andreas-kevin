const getAuthHeader = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const updateProjectName = async (projectId: string, name: string) => {
  const headers = getAuthHeader();
  if (!headers) throw new Error("Unauthorized"); 

  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    console.error("Update project name error:", error);
    throw error;
  }
};

export const deleteProject = async (projectId: string) => {
  const headers = getAuthHeader();
  if (!headers) return { success: false, error: "Unauthorized" };
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok)
      throw new Error((await response.json()).error || "Gagal hapus");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const inviteMember = async (projectId: string, email: string) => {
  const headers = getAuthHeader();
  if (!headers) return { success: false, error: "Unauthorized" };
  try {
    const response = await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error((await response.json()).error || "Gagal mengundang");
    }
    return { success: true, data: await response.json() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const removeMember = async (projectId: string, membershipId: string) => {
  const headers = getAuthHeader();
  if (!headers) return { success: false, error: "Unauthorized" };
  try {
    const response = await fetch(`/api/projects/${projectId}/members/${membershipId}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ membershipId }),
    });
    if (!response.ok)
      throw new Error((await response.json()).error || "Gagal menghapus");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

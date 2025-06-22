import type { LoginApiResponse } from "@/lib/definition";

interface LoginCredentials {
  email: string;
  password: string;
}

interface ControllerResponse extends LoginApiResponse {
  success: boolean;
}

/**
 * @param credentials 
 * @returns  */
export async function loginUser(
  credentials: LoginCredentials
): Promise<ControllerResponse> {
  const { email, password } = credentials;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Terjadi kesalahan yang tidak diketahui");
    }

    return {
      success: true,
      ...data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

import { format } from "path";

export interface LoginApiResponse {
  token?: string;
  message?: string;
  user?: UserSafeData;
  error?: string;
}

export interface LoginFormState {
  email: string;
  password: string;
}

export interface UserSafeData {
  /**
   * @format uuid
   */
  id: string;
  email: string;
}

// export interface DeleteProjectAPIResponse {
//   message: string;
//   error?: string;
// }
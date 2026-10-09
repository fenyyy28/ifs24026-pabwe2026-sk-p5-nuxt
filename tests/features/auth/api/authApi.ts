import { apiPost } from "~/helpers/apiHelper";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export interface LoginResult {
  token: string;
}

/** POST /auth/login */
export async function login(payload: LoginPayload): Promise<LoginResult> {
  const response = await apiPost<LoginResult>("/auth/login", payload, false);
  return response.data;
}

/** POST /auth/register. Mengembalikan pesan sukses dari server. */
export async function register(payload: RegisterPayload): Promise<string> {
  const response = await apiPost("/auth/register", payload, false);
  return response.message;
}
import { apiGet, apiPost, apiPut } from "~/helpers/apiHelper";

export interface User {
  id: number | string;
  name: string;
  email: string;
  photo?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  bio: string;
}

export interface ChangePasswordPayload {
  password: string;
  new_password: string;
}

/** GET /users */
export async function getUsers(): Promise<User[]> {
  const response = await apiGet<{ users: User[] }>("/users");
  return response.data.users;
}

/** GET /users/me */
export async function getMe(): Promise<User> {
  const response = await apiGet<{ user: User }>("/users/me");
  return response.data.user;
}

/** PUT /users/me. Mengembalikan pesan sukses. */
export async function updateMe(payload: UpdateProfilePayload): Promise<string> {
  const response = await apiPut("/users/me", payload);
  return response.message;
}

/** POST /users/me/photo (multipart/form-data). Mengembalikan pesan sukses. */
export async function uploadPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append("photo", file);
  const response = await apiPost("/users/me/photo", form);
  return response.message;
}

/** PUT /users/me/password. Mengembalikan pesan sukses. */
export async function changePassword(payload: ChangePasswordPayload): Promise<string> {
  const response = await apiPut("/users/me/password", payload);
  return response.message;
}
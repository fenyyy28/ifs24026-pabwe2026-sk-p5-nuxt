import { apiGet, apiPost, apiPut } from "~/helpers/apiHelper";

export interface User {
  id: number | string;
  name: string;
  email: string;
  photo?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  password: string;
  new_password: string;
  new_password_confirmation: string;
}

/** /users/me mengembalikan foto relatif ("img/profile/1.png"); jadikan URL absolut. */
function normalizeUser(user: User): User {
  if (!user.photo) return user;
  const origin = `${new URL(DELCOM_BASEURL).origin}/`;
  return { ...user, photo: new URL(user.photo, origin).href };
}

/** GET /users */
export async function getUsers(): Promise<User[]> {
  const response = await apiGet<{ users: User[] }>("/users");
  return response.data.users.map(normalizeUser);
}

/** GET /users/me */
export async function getMe(): Promise<User> {
  const response = await apiGet<{ user: User }>("/users/me");
  return normalizeUser(response.data.user);
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

/** PUT /users/password (sesuai dokumentasi API). Mengembalikan pesan sukses. */
export async function changePassword(payload: ChangePasswordPayload): Promise<string> {
  const response = await apiPut("/users/password", payload);
  return response.message;
}
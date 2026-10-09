import { defineStore } from "pinia";
import * as userApi from "~/features/users/api/userApi";
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
  User,
} from "~/features/users/api/userApi";

export interface UsersState {
  users: User[];
  profile: User | null;
  isLoadingUsers: boolean;
  isLoadingProfile: boolean;
  isSaving: boolean;
}

export const useUsersStore = defineStore("users", {
  state: (): UsersState => ({
    users: [],
    profile: null,
    isLoadingUsers: false,
    isLoadingProfile: false,
    isSaving: false,
  }),

  actions: {
    async fetchUsers(): Promise<void> {
      this.isLoadingUsers = true;
      try {
        this.users = await userApi.getUsers();
      } finally {
        this.isLoadingUsers = false;
      }
    },

    async fetchProfile(): Promise<void> {
      this.isLoadingProfile = true;
      try {
        this.profile = await userApi.getMe();
      } finally {
        this.isLoadingProfile = false;
      }
    },

    async updateProfile(payload: UpdateProfilePayload): Promise<string> {
      this.isSaving = true;
      try {
        const message = await userApi.updateMe(payload);
        this.profile = await userApi.getMe();
        return message;
      } finally {
        this.isSaving = false;
      }
    },

    async uploadPhoto(file: File): Promise<string> {
      this.isSaving = true;
      try {
        const message = await userApi.uploadPhoto(file);
        this.profile = await userApi.getMe();
        return message;
      } finally {
        this.isSaving = false;
      }
    },

    async changePassword(payload: ChangePasswordPayload): Promise<string> {
      this.isSaving = true;
      try {
        return await userApi.changePassword(payload);
      } finally {
        this.isSaving = false;
      }
    },

    /** Dipanggil saat logout. */
    clear(): void {
      this.users = [];
      this.profile = null;
    },
  },
});
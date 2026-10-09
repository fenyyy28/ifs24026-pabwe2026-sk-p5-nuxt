import { defineStore } from "pinia";
import * as authApi from "~/features/auth/api/authApi";
import type { LoginPayload, RegisterPayload } from "~/features/auth/api/authApi";
import { getAccessToken, putAccessToken, removeAccessToken } from "~/helpers/apiHelper";

export interface AuthState {
  token: string | null;
  isLoading: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: getAccessToken(),
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state): boolean => state.token !== null,
  },

  actions: {
    async login(payload: LoginPayload): Promise<void> {
      this.isLoading = true;
      try {
        const { token } = await authApi.login(payload);
        putAccessToken(token);
        this.token = token;
      } finally {
        this.isLoading = false;
      }
    },

    async register(payload: RegisterPayload): Promise<string> {
      this.isLoading = true;
      try {
        return await authApi.register(payload);
      } finally {
        this.isLoading = false;
      }
    },

    logout(): void {
      removeAccessToken();
      this.token = null;
    },
  },
});
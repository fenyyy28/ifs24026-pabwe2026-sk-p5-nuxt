<script setup lang="ts">
import { useRouter } from "vue-router";
import { LogOut, UserRound, Users, Wallet } from "lucide-vue-next";
import UserAvatar from "~/components/UserAvatar.vue";
import { useAuthStore } from "~/features/auth/states/authStore";
import { useUsersStore } from "~/features/users/states/usersStore";
import type { ApiError } from "~/helpers/apiHelper";
import { showErrorDialog } from "~/helpers/toolsHelper";

const router = useRouter();
const auth = useAuthStore();
const store = useUsersStore();

async function handleLogout(): Promise<void> {
  auth.logout();
  store.clear();
  await router.push("/auth/login");
}

async function loadProfile(): Promise<void> {
  if (store.profile) return;
  try {
    await store.fetchProfile();
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.statusCode === 401) {
      await handleLogout();
    } else {
      await showErrorDialog(apiError.message);
    }
  }
}

void loadProfile();
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-5xl items-center gap-2 px-4 sm:px-6">
        <NuxtLink to="/" class="mr-2 flex items-center gap-2 font-extrabold tracking-tight text-slate-900">
          <span class="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <Wallet class="size-5" />
          </span>
          <span class="hidden sm:inline">Delcom Cash Flow</span>
        </NuxtLink>

        <nav class="flex flex-1 items-center gap-1">
          <NuxtLink to="/users" class="nav-link">
            <Users class="size-4" />
            <span class="hidden sm:inline">Pengguna</span>
          </NuxtLink>
          <NuxtLink to="/profile" class="nav-link">
            <UserRound class="size-4" />
            <span class="hidden sm:inline">Profil</span>
          </NuxtLink>
        </nav>

        <div v-if="store.profile" class="flex items-center gap-2">
          <div class="size-9">
            <UserAvatar :name="store.profile.name" :photo="store.profile.photo" />
          </div>
          <span class="hidden max-w-32 truncate text-sm font-semibold text-slate-700 md:inline">
            {{ store.profile.name }}
          </span>
        </div>

        <button
          id="logout-button"
          type="button"
          class="btn-secondary"
          aria-label="Keluar"
          @click="handleLogout"
        >
          <LogOut class="size-4" />
          <span class="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <slot />
    </main>
  </div>
</template>
<script setup lang="ts">
import { LogOut, Wallet } from "lucide-vue-next";
import UserAvatar from "~/components/UserAvatar.vue";
import { useAuthStore } from "~/features/auth/states/authStore";
import { useUsersStore } from "~/features/users/states/usersStore";
import { useLogout } from "~/hooks/useLogout";

const auth = useAuthStore();
const store = useUsersStore();
const logout = useLogout();
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
      <NuxtLink to="/" class="flex items-center gap-2 font-extrabold tracking-tight text-slate-900">
        <span class="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white">
          <Wallet class="size-5" />
        </span>
        <span class="hidden sm:inline">Delcom Cash Flow</span>
      </NuxtLink>

      <div class="flex-1" />

      <span
        id="session-status"
        class="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex"
      >
        <span class="size-2 rounded-full" :class="auth.isAuthenticated ? 'bg-emerald-500' : 'bg-slate-400'" />
        {{ auth.isAuthenticated ? "Sesi aktif" : "Sesi tidak aktif" }}
      </span>

      <div v-if="store.profile" class="flex items-center gap-2.5">
        <div class="size-9">
          <UserAvatar :name="store.profile.name" :photo="store.profile.photo" />
        </div>
        <div class="hidden min-w-0 leading-tight md:block">
          <p class="max-w-40 truncate text-sm font-semibold text-slate-800">{{ store.profile.name }}</p>
          <p class="max-w-40 truncate text-xs text-slate-500">{{ store.profile.email }}</p>
        </div>
      </div>

      <button id="logout-button" type="button" class="btn-secondary" aria-label="Keluar" @click="logout">
        <LogOut class="size-4" />
        <span class="hidden sm:inline">Keluar</span>
      </button>
    </div>
  </header>
</template>
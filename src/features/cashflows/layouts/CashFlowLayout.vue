<script setup lang="ts">
import NavbarComponent from "~/features/cashflows/components/NavbarComponent.vue";
import SidebarComponent from "~/features/cashflows/components/SidebarComponent.vue";
import { useUsersStore } from "~/features/users/states/usersStore";
import type { ApiError } from "~/helpers/apiHelper";
import { showErrorDialog } from "~/helpers/toolsHelper";
import { useLogout } from "~/hooks/useLogout";

const store = useUsersStore();
const logout = useLogout();

async function loadProfile(): Promise<void> {
  if (store.profile) return;
  try {
    await store.fetchProfile();
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.statusCode === 401) {
      await logout();
    } else {
      await showErrorDialog(apiError.message);
    }
  }
}

void loadProfile();
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <NavbarComponent />
    <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
      <SidebarComponent />
      <main class="min-w-0 flex-1">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>
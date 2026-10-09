<script setup lang="ts">
import { computed } from "vue";
import { Search, SearchX } from "lucide-vue-next";
import AppLayout from "~/components/AppLayout.vue";
import UserAvatar from "~/components/UserAvatar.vue";
import { useUsersStore } from "~/features/users/states/usersStore";
import type { ApiError } from "~/helpers/apiHelper";
import { formatDate, showErrorDialog } from "~/helpers/toolsHelper";
import { useInput } from "~/hooks/useInput";

const store = useUsersStore();
const { value: keyword, onChange: onKeywordInput } = useInput("");

const filtered = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  return store.users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query));
});

async function loadUsers(): Promise<void> {
  try {
    await store.fetchUsers();
  } catch (error) {
    await showErrorDialog((error as ApiError).message);
  }
}

void loadUsers();
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Pengguna</h1>
          <p class="mt-1 text-slate-500">Daftar seluruh pengguna yang terdaftar di sistem.</p>
        </div>
        <div class="relative w-full sm:w-72">
          <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="users-search-input"
            type="search"
            placeholder="Cari nama atau email"
            class="input-field"
            :value="keyword"
            @input="onKeywordInput"
          />
        </div>
      </div>

      <div
        v-if="store.isLoadingUsers"
        id="users-skeleton"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div v-for="n in 6" :key="n" class="h-24 animate-pulse rounded-2xl bg-slate-200" />
      </div>

      <div
        v-else-if="filtered.length === 0"
        id="users-empty"
        class="card flex flex-col items-center gap-2 py-12 text-center text-slate-500"
      >
        <SearchX class="size-8 text-slate-400" />
        <p class="font-semibold text-slate-700">Pengguna tidak ditemukan</p>
        <p class="text-sm">Coba kata kunci lain.</p>
      </div>

      <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="user in filtered" :key="user.id" class="card flex items-center gap-4">
          <div class="size-12 shrink-0">
            <UserAvatar :name="user.name" :photo="user.photo" />
          </div>
          <div class="min-w-0">
            <p class="truncate font-semibold text-slate-900">{{ user.name }}</p>
            <p class="truncate text-sm text-slate-500">{{ user.email }}</p>
            <p class="mt-1 text-xs text-slate-400">Bergabung {{ formatDate(user.created_at) }}</p>
          </div>
        </li>
      </ul>
    </div>
  </AppLayout>
</template>
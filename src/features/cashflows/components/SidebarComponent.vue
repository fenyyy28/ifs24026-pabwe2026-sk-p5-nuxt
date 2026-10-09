<script setup lang="ts">
import { LayoutDashboard, UserRound, Users } from "lucide-vue-next";
</script>

<template>
  <aside class="lg:w-60 lg:shrink-0">
    <nav class="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:sticky lg:top-24 lg:flex-col">
      <NuxtLink to="/" class="nav-link">
        <LayoutDashboard class="size-4" />
        Ringkasan Arus Kas
      </NuxtLink>
      <NuxtLink to="/users" class="nav-link">
        <Users class="size-4" />
        Direktori Pengguna
      </NuxtLink>
      <NuxtLink to="/profile" class="nav-link">
        <UserRound class="size-4" />
        Profil Saya
      </NuxtLink>
    </nav>
  </aside>
</template>
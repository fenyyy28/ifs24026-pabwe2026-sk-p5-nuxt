<script setup lang="ts">
import { BarChart3, ShieldCheck, Wallet } from "lucide-vue-next";
</script>

<template>
  <div class="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
    <aside
      class="relative hidden overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white lg:flex lg:flex-col lg:justify-between"
    >
      <div class="absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
      <div class="absolute -bottom-32 -left-16 size-96 rounded-full bg-violet-400/20 blur-3xl" />

      <div class="relative flex items-center gap-3">
        <div class="grid size-11 place-items-center rounded-xl bg-white/15 backdrop-blur">
          <Wallet class="size-6" />
        </div>
        <span class="text-xl font-extrabold tracking-tight">Delcom Cash Flow</span>
      </div>

      <div class="relative max-w-md">
        <h2 class="text-4xl font-extrabold leading-tight">
          Kelola arus kas pribadi dengan lebih tenang.
        </h2>
        <ul class="mt-8 space-y-4 text-indigo-100">
          <li class="flex items-start gap-3">
            <BarChart3 class="mt-0.5 size-5 shrink-0" />
            <span>Pantau pemasukan dan pengeluaran secara harian maupun bulanan.</span>
          </li>
          <li class="flex items-start gap-3">
            <ShieldCheck class="mt-0.5 size-5 shrink-0" />
            <span>Data tersimpan aman dan hanya bisa diakses oleh akun Anda.</span>
          </li>
        </ul>
      </div>

      <p class="relative text-sm text-indigo-200">Praktikum PABWE 2026</p>
    </aside>

    <main class="flex min-h-screen items-center justify-center px-6 py-12 lg:min-h-0">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <div class="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white">
            <Wallet class="size-5" />
          </div>
          <span class="text-lg font-extrabold tracking-tight">Delcom Cash Flow</span>
        </div>

        <NuxtPage />
      </div>
    </main>
  </div>
</template>
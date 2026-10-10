<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Eye, EyeOff, LoaderCircle, Lock, Mail } from "lucide-vue-next";
import { useAuthStore } from "~/features/auth/states/authStore";
import type { ApiError } from "~/helpers/apiHelper";
import { showErrorDialog } from "~/helpers/toolsHelper";
import { useInput } from "~/hooks/useInput";

const router = useRouter();
const auth = useAuthStore();

const { value: email, onChange: onEmailInput } = useInput("");
const { value: password, onChange: onPasswordInput } = useInput("");
const showPassword = ref(false);
const errors = ref<Record<string, string[]>>({});

async function handleSubmit(): Promise<void> {
  errors.value = {};
  try {
    await auth.login({ email: email.value, password: password.value });
    await router.push("/");
  } catch (error) {
    const apiError = error as ApiError;
    errors.value = apiError.errors;
    await showErrorDialog(apiError.message);
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Selamat datang kembali</h1>
    <p class="mt-2 text-slate-500">Masuk untuk melanjutkan ke akun Anda.</p>

    <form class="mt-8 space-y-5" novalidate @submit.prevent="handleSubmit">
      <div>
        <label for="login-email-input" class="mb-1.5 block text-sm font-semibold text-slate-700">
          Email
        </label>
        <div class="relative">
          <Mail class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="login-email-input"
            type="email"
            autocomplete="email"
            placeholder="nama@email.com"
            class="input-field"
            :value="email"
            @input="onEmailInput"
          />
        </div>
        <p v-if="errors.email" class="mt-1.5 text-xs text-rose-600">{{ errors.email[0] }}</p>
      </div>

      <div>
        <label for="login-password-input" class="mb-1.5 block text-sm font-semibold text-slate-700">
          Kata sandi
        </label>
        <div class="relative">
          <Lock class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="login-password-input"
            autocomplete="current-password"
            placeholder="Masukkan kata sandi"
            class="input-field pr-10"
            :type="showPassword ? 'text' : 'password'"
            :value="password"
            @input="onPasswordInput"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" class="size-4" />
            <Eye v-else class="size-4" />
          </button>
        </div>
        <p v-if="errors.password" class="mt-1.5 text-xs text-rose-600">{{ errors.password[0] }}</p>
      </div>

      <button id="login-submit-button" type="submit" class="btn-primary" :disabled="auth.isLoading">
        <LoaderCircle v-if="auth.isLoading" class="size-4 animate-spin" />
        {{ auth.isLoading ? "Memproses..." : "Masuk" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Belum punya akun?
      <NuxtLink to="/auth/register" class="font-semibold text-indigo-600 hover:text-indigo-700">
        Daftar sekarang
      </NuxtLink>
    </p>
  </div>
</template>
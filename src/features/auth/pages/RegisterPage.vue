<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Eye, EyeOff, LoaderCircle, Lock, Mail, User } from "lucide-vue-next";
import AuthLayout from "~/features/auth/layouts/AuthLayout.vue";
import { useAuthStore } from "~/features/auth/states/authStore";
import type { ApiError } from "~/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "~/helpers/toolsHelper";
import { useInput } from "~/hooks/useInput";

const router = useRouter();
const auth = useAuthStore();

const { value: name, onChange: onNameInput } = useInput("");
const { value: email, onChange: onEmailInput } = useInput("");
const { value: password, onChange: onPasswordInput } = useInput("");
const showPassword = ref(false);
const errors = ref<Record<string, string[]>>({});

async function handleSubmit(): Promise<void> {
  errors.value = {};
  try {
    const message = await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });
    await showSuccessDialog(message);
    await router.push("/auth/login");
  } catch (error) {
    const apiError = error as ApiError;
    errors.value = apiError.errors;
    await showErrorDialog(apiError.message);
  }
}
</script>

<template>
  <AuthLayout title="Buat akun baru" subtitle="Daftar gratis dan mulai catat arus kas Anda.">
    <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
      <div>
        <label for="register-name-input" class="mb-1.5 block text-sm font-semibold text-slate-700">
          Nama lengkap
        </label>
        <div class="relative">
          <User class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="register-name-input"
            type="text"
            autocomplete="name"
            placeholder="Nama Anda"
            class="input-field"
            :value="name"
            @input="onNameInput"
          />
        </div>
        <p v-if="errors.name" class="mt-1.5 text-xs text-rose-600">{{ errors.name[0] }}</p>
      </div>

      <div>
        <label for="register-email-input" class="mb-1.5 block text-sm font-semibold text-slate-700">
          Email
        </label>
        <div class="relative">
          <Mail class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="register-email-input"
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
        <label for="register-password-input" class="mb-1.5 block text-sm font-semibold text-slate-700">
          Kata sandi
        </label>
        <div class="relative">
          <Lock class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="register-password-input"
            autocomplete="new-password"
            placeholder="Buat kata sandi"
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

      <button id="register-submit-button" type="submit" class="btn-primary" :disabled="auth.isLoading">
        <LoaderCircle v-if="auth.isLoading" class="size-4 animate-spin" />
        {{ auth.isLoading ? "Memproses..." : "Daftar" }}
      </button>
    </form>

    <template #footer>
      Sudah punya akun?
      <NuxtLink to="/auth/login" class="font-semibold text-indigo-600 hover:text-indigo-700">
        Masuk
      </NuxtLink>
    </template>
  </AuthLayout>
</template>
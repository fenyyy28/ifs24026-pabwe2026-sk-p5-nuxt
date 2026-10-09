<script setup lang="ts">
import { ref, watch, type Ref } from "vue";
import { Camera, KeyRound, Save } from "lucide-vue-next";
import AppLayout from "~/components/AppLayout.vue";
import UserAvatar from "~/components/UserAvatar.vue";
import { useUsersStore } from "~/features/users/states/usersStore";
import type { ApiError } from "~/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "~/helpers/toolsHelper";
import { useInput } from "~/hooks/useInput";

type FieldErrors = Record<string, string[]>;

const store = useUsersStore();

const { value: name, onChange: onNameInput } = useInput("");
const { value: email, onChange: onEmailInput } = useInput("");
const { value: bio, onChange: onBioInput } = useInput("");
const {
  value: currentPassword,
  onChange: onCurrentPasswordInput,
  reset: resetCurrentPassword,
} = useInput("");
const {
  value: newPassword,
  onChange: onNewPasswordInput,
  reset: resetNewPassword,
} = useInput("");

const profileErrors = ref<FieldErrors>({});
const passwordErrors = ref<FieldErrors>({});
const photoErrors = ref<FieldErrors>({});

// Isi form dengan data profil saat tersedia
watch(
  () => store.profile,
  (profile) => {
    if (profile) {
      name.value = profile.name;
      email.value = profile.email;
      bio.value = profile.bio ?? "";
    }
  },
  { immediate: true },
);

/** Menjalankan aksi, menampilkan dialog hasil, dan mengisi error per field. */
async function run(action: () => Promise<string>, errors: Ref<FieldErrors>): Promise<boolean> {
  errors.value = {};
  try {
    await showSuccessDialog(await action());
    return true;
  } catch (error) {
    const apiError = error as ApiError;
    errors.value = apiError.errors;
    await showErrorDialog(apiError.message);
    return false;
  }
}

async function saveProfile(): Promise<void> {
  await run(
    () => store.updateProfile({ name: name.value, email: email.value, bio: bio.value }),
    profileErrors,
  );
}

async function onPhotoChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files![0];
  if (!file) return;
  await run(() => store.uploadPhoto(file), photoErrors);
  input.value = "";
}

async function savePassword(): Promise<void> {
  const ok = await run(
    () =>
      store.changePassword({
        password: currentPassword.value,
        new_password: newPassword.value,
      }),
    passwordErrors,
  );
  if (ok) {
    resetCurrentPassword();
    resetNewPassword();
  }
}
</script>

<template>
  <AppLayout>
    <div class="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Pengaturan Profil</h1>
        <p class="mt-1 text-slate-500">Kelola informasi akun dan keamanan Anda.</p>
      </div>

      <div v-if="!store.profile" id="profile-skeleton" class="h-64 animate-pulse rounded-2xl bg-slate-200" />

      <template v-else>
        <section class="card flex flex-col items-center gap-5 sm:flex-row">
          <div class="size-24 shrink-0">
            <UserAvatar :name="store.profile.name" :photo="store.profile.photo" />
          </div>
          <div class="text-center sm:text-left">
            <h2 class="text-lg font-bold text-slate-900">{{ store.profile.name }}</h2>
            <p class="text-sm text-slate-500">{{ store.profile.email }}</p>
            <label for="profile-photo-input" class="btn-secondary mt-3 cursor-pointer">
              <Camera class="size-4" />
              Ganti foto
            </label>
            <input
              id="profile-photo-input"
              type="file"
              accept="image/*"
              class="sr-only"
              @change="onPhotoChange"
            />
            <p v-if="photoErrors.photo" class="mt-1.5 text-xs text-rose-600">
              {{ photoErrors.photo[0] }}
            </p>
          </div>
        </section>

        <section class="card">
          <h2 class="text-lg font-bold text-slate-900">Informasi akun</h2>
          <form class="mt-5 space-y-4" novalidate @submit.prevent="saveProfile">
            <div>
              <label for="profile-name-input" class="mb-1.5 block text-sm font-semibold text-slate-700">Nama</label>
              <input id="profile-name-input" type="text" class="input-plain" :value="name" @input="onNameInput" />
              <p v-if="profileErrors.name" class="mt-1.5 text-xs text-rose-600">{{ profileErrors.name[0] }}</p>
            </div>
            <div>
              <label for="profile-email-input" class="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
              <input id="profile-email-input" type="email" class="input-plain" :value="email" @input="onEmailInput" />
              <p v-if="profileErrors.email" class="mt-1.5 text-xs text-rose-600">{{ profileErrors.email[0] }}</p>
            </div>
            <div>
              <label for="profile-bio-input" class="mb-1.5 block text-sm font-semibold text-slate-700">Bio</label>
              <textarea
                id="profile-bio-input"
                rows="3"
                placeholder="Ceritakan sedikit tentang Anda"
                class="input-plain resize-none"
                :value="bio"
                @input="onBioInput"
              />
              <p v-if="profileErrors.bio" class="mt-1.5 text-xs text-rose-600">{{ profileErrors.bio[0] }}</p>
            </div>
            <div class="flex justify-end">
              <button id="profile-save-button" type="submit" class="btn-primary sm:w-auto" :disabled="store.isSaving">
                <Save class="size-4" />
                Simpan perubahan
              </button>
            </div>
          </form>
        </section>

        <section class="card">
          <h2 class="text-lg font-bold text-slate-900">Ubah kata sandi</h2>
          <form class="mt-5 space-y-4" novalidate @submit.prevent="savePassword">
            <div>
              <label for="profile-current-password-input" class="mb-1.5 block text-sm font-semibold text-slate-700">
                Kata sandi saat ini
              </label>
              <input
                id="profile-current-password-input"
                type="password"
                autocomplete="current-password"
                class="input-plain"
                :value="currentPassword"
                @input="onCurrentPasswordInput"
              />
              <p v-if="passwordErrors.password" class="mt-1.5 text-xs text-rose-600">
                {{ passwordErrors.password[0] }}
              </p>
            </div>
            <div>
              <label for="profile-new-password-input" class="mb-1.5 block text-sm font-semibold text-slate-700">
                Kata sandi baru
              </label>
              <input
                id="profile-new-password-input"
                type="password"
                autocomplete="new-password"
                class="input-plain"
                :value="newPassword"
                @input="onNewPasswordInput"
              />
              <p v-if="passwordErrors.new_password" class="mt-1.5 text-xs text-rose-600">
                {{ passwordErrors.new_password[0] }}
              </p>
            </div>
            <div class="flex justify-end">
              <button id="password-save-button" type="submit" class="btn-primary sm:w-auto" :disabled="store.isSaving">
                <KeyRound class="size-4" />
                Ubah kata sandi
              </button>
            </div>
          </form>
        </section>
      </template>
    </div>
  </AppLayout>
</template>
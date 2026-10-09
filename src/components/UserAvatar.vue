<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  name: string;
  photo?: string | null;
}>();

const initials = computed(() =>
  props.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase(),
);
</script>

<template>
  <img v-if="photo" :src="photo" :alt="name" class="size-full rounded-full object-cover" />
  <div v-else class="@container size-full">
    <span
      class="grid size-full place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700 text-[38cqw]"
    >
      {{ initials }}
    </span>
  </div>
</template>
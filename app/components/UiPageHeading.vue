<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 md:text-3xl">{{ title }}</h1>
      <p v-if="description" class="mt-1 text-sm text-slate-500 md:text-base">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="shrink-0 self-start sm:self-auto"><slot name="actions" /></div>
  </div>
</template>

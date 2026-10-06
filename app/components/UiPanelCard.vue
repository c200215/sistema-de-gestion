<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <header v-if="title || $slots.actions" class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 md:px-6">
      <div class="min-w-0">
        <h2 v-if="title" class="text-base font-bold text-slate-900 md:text-lg">{{ title }}</h2>
        <p v-if="description" class="text-sm text-slate-500">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="shrink-0"><slot name="actions" /></div>
    </header>
    <slot />
  </section>
</template>

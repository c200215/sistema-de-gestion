<script setup lang="ts">
import type { EventoHistorial } from '~/data/trabajos'

defineProps<{ eventos: EventoHistorial[] }>()
</script>

<template>
  <ol class="flex flex-col gap-5 px-4 py-5 md:px-6">
    <li v-for="(evento, i) in eventos" :key="`${evento.fecha}-${i}`" class="relative flex gap-3">
      <span v-if="i < eventos.length - 1" class="absolute -bottom-5 left-[5px] top-4 w-px bg-slate-200" />
      <span class="relative mt-1.5 h-2.75 w-2.75 shrink-0 rounded-full" :class="i === 0 ? 'bg-teal-600' : 'bg-slate-300'" />
      <div>
        <p class="text-sm text-slate-700">{{ evento.texto }}</p>
        <p class="text-xs text-slate-400">{{ evento.fecha }}</p>
      </div>
    </li>
  </ol>
</template>

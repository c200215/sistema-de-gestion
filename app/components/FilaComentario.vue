<script setup lang="ts">
import type { Entrada } from '~/data/trabajos'

defineProps<{
  entrada: Entrada
  yo: string
  contexto?: string
}>()
</script>

<template>
  <li class="flex gap-3 px-4 py-4 md:px-6">
    <span
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
      :class="entrada.autor === useSesion().value.nombre ? 'bg-linear-to-br from-teal-600 to-blue-800 text-white' : entrada.autor === yo ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'"
    >{{ iniciales(entrada.autor) }}</span>
    <div class="min-w-0 flex-1">
      <p class="text-sm">
        <span class="font-semibold text-slate-900">{{ entrada.autor }}{{ entrada.autor === yo ? ' (tú)' : '' }}</span>
        <span class="text-xs text-slate-400"> {{ entrada.fecha }}</span>
      </p>
      <p v-if="contexto" class="text-xs text-teal-700">{{ contexto }}</p>
      <p class="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">{{ entrada.texto }}</p>
    </div>
  </li>
</template>

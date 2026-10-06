<script setup lang="ts">
import type { Tarea, Trabajo } from '~/data/trabajos'

const props = defineProps<{
  tarea: Tarea
  trabajo: Trabajo
  enlace: string
}>()

const vencida = computed(() => props.tarea.vencida && props.tarea.estado !== 'Terminado')
</script>

<template>
  <div>
    <div class="flex items-start gap-2">
      <NuxtLink :to="enlace" class="block min-w-0 flex-1 truncate text-xs text-slate-400 hover:text-teal-700">{{ trabajo.codigo }} · {{ trabajo.titulo }}</NuxtLink>
      <span data-asa aria-hidden="true" class="drag-handle -mr-1 -mt-1 shrink-0 cursor-grab touch-none rounded-md p-1 text-slate-300 group-hover:text-slate-500">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg>
      </span>
    </div>
    <p class="mt-1.5 font-semibold text-slate-900" :class="tarea.estado === 'Terminado' ? 'line-through decoration-slate-300' : ''">{{ tarea.titulo }}</p>
    <p class="mt-1 line-clamp-2 text-sm text-slate-500">{{ tarea.descripcion }}</p>
    <div class="mt-4 flex items-center justify-between gap-3 text-xs">
      <p class="flex items-center gap-1.5" :class="vencida ? 'font-semibold text-rose-600' : 'text-slate-500'">
        <UiIcono nombre="calendario" clase="h-4 w-4" grosor="2" />
        {{ vencida ? 'Venció el' : 'Vence el' }} {{ tarea.fecha }}
      </p>
      <p class="flex items-center gap-1" :class="tarea.documentos.length ? 'text-teal-700' : 'text-slate-400'" title="Documentos de respaldo">
        <UiIcono nombre="clip" clase="h-4 w-4" grosor="2" />
        {{ tarea.documentos.length }}
      </p>
    </div>
  </div>
</template>

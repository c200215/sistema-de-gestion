<script setup lang="ts">
import type { Documento } from '~/data/trabajos'

const props = defineProps<{
  documento: Documento
  origen?: string
  puedeQuitar?: boolean
}>()

const emit = defineEmits<{ quitar: [] }>()
const { mostrar } = useAviso()
const ext = computed(() => extension(props.documento.nombre))
</script>

<template>
  <li class="flex items-center gap-3 px-4 py-3.5 md:px-6">
    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase" :class="coloresArchivo[ext] ?? 'bg-slate-100 text-slate-600'">{{ ext }}</span>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-slate-900">{{ documento.nombre }}</p>
      <p class="text-xs text-slate-500">{{ documento.peso }} · {{ documento.autor }} · {{ documento.fecha }}</p>
      <p v-if="origen" class="truncate text-xs text-teal-700">{{ origen }}</p>
    </div>
    <button v-if="puedeQuitar" type="button" class="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50" @click="emit('quitar')">Quitar</button>
    <button type="button" :title="`Descargar ${documento.nombre}`" :aria-label="`Descargar ${documento.nombre}`" class="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-teal-700" @click="documento.id ? navigateTo('/api/documentos/'+documento.id, { external: true, open: { target: '_blank' } }) : mostrar('Este adjunto de ejemplo no tiene un archivo almacenado')">
      <UiIcono nombre="descargar" grosor="2" />
    </button>
  </li>
</template>

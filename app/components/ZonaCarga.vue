<script setup lang="ts">
const emit = defineEmits<{ archivos: [File[]] }>()
const encima = ref(false)
const input = ref<HTMLInputElement | null>(null)

function alSeleccionar(e: Event) {
  const campo = e.target as HTMLInputElement
  emit('archivos', [...(campo.files ?? [])])
  campo.value = ''
}

function alSoltar(e: DragEvent) {
  encima.value = false
  emit('archivos', [...(e.dataTransfer?.files ?? [])])
}

defineExpose({ abrir: () => input.value?.click() })
</script>

<template>
  <label
    class="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-7 text-center transition"
    :class="encima ? 'border-teal-600 bg-teal-50/50' : 'border-slate-300 bg-slate-50 hover:border-teal-600 hover:bg-teal-50/50'"
    @dragenter.prevent="encima = true"
    @dragover.prevent="encima = true"
    @dragleave.prevent="encima = false"
    @drop.prevent="alSoltar"
  >
    <UiIcono nombre="subir" clase="h-8 w-8 text-teal-600" />
    <span class="font-medium text-slate-800">Arrastra archivos aquí o <span class="text-teal-700 underline underline-offset-4">selecciónalos</span></span>
    <span class="text-sm text-slate-500">PDF, Word, Excel o imágenes. Hasta 5 MB por archivo.</span>
    <input ref="input" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" class="sr-only" @change="alSeleccionar">
  </label>
</template>

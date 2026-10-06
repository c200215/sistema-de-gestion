<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  description?: string
  maxWidth?: string
}>(), {
  maxWidth: 'max-w-2xl',
})

const emit = defineEmits<{ close: [] }>()

function alPresionarTecla(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', alPresionarTecla))
onBeforeUnmount(() => window.removeEventListener('keydown', alPresionarTecla))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <section role="dialog" aria-modal="true" :aria-label="title" class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/30" :class="maxWidth">
        <header class="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-5 sm:px-6">
          <div>
            <h2 class="text-xl font-bold text-slate-900">{{ title }}</h2>
            <p v-if="description" class="mt-1 text-sm text-slate-500">{{ description }}</p>
            <slot name="subtitle" />
          </div>
          <button type="button" aria-label="Cerrar" class="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" @click="emit('close')">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </header>
        <div class="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>

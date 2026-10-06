<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string | number
  tone?: 'primary' | 'blue' | 'amber' | 'rose' | 'teal' | 'slate'
}>(), {
  tone: 'slate',
})

const puntos = {
  primary: '',
  blue: 'bg-blue-700',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  teal: 'bg-teal-600',
  slate: 'bg-slate-400',
}
</script>

<template>
  <article
    class="rounded-2xl p-4 md:p-6"
    :class="tone === 'primary' ? 'bg-linear-to-br from-teal-600 to-blue-800 text-white shadow-xl shadow-blue-800/20' : 'border border-slate-200 bg-white'"
  >
    <p class="font-bold" :class="tone === 'primary' ? 'text-4xl md:text-5xl' : 'text-3xl text-slate-900 md:text-4xl'">{{ value }}</p>
    <p class="mt-2 flex items-center gap-1.5 text-xs sm:text-sm md:mt-3 md:gap-2 md:text-base" :class="tone === 'primary' ? 'text-teal-50' : 'text-slate-500'">
      <span v-if="tone !== 'primary'" class="h-2 w-2 shrink-0 rounded-full" :class="puntos[tone]" />
      {{ label }}
    </p>
  </article>
</template>

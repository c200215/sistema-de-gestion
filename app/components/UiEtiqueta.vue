<script setup lang="ts">
defineProps<{
  texto: string
  clases: string
}>()
</script>

<template>
  <span class="inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium" :class="clases">{{ texto }}</span>
</template>

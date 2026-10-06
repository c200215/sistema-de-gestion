<script setup lang="ts">
withDefaults(defineProps<{
  nombre: string
  clase?: string
  grosor?: string
}>(), {
  clase: 'h-5 w-5',
  grosor: '1.75',
})
</script>

<template>
  <svg :class="clase" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="grosor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="nombre === 'inicio'"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M10 20v-6h4v6" /></template>
    <template v-else-if="nombre === 'trabajos'"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></template>
    <template v-else-if="nombre === 'correos' || nombre === 'correo'"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></template>
    <template v-else-if="nombre === 'equipo'"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18 14.3a6.5 6.5 0 0 1 3.5 5.7" /></template>
    <template v-else-if="nombre === 'reportes'"><path d="M3 3v18h18" /><path d="M8 17v-5" /><path d="M13 17V8" /><path d="M18 17v-9" /></template>
    <template v-else-if="nombre === 'tareas'"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="m8 12 3 3 5-6" /></template>
    <template v-else-if="nombre === 'chat'"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12Z" /></template>
    <template v-else-if="nombre === 'campana'"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></template>
    <template v-else-if="nombre === 'check'"><path d="M20 6 9 17l-5-5" /></template>
    <template v-else-if="nombre === 'clip'"><path d="m21 11-8.6 8.6a5 5 0 0 1-7-7l8.6-8.6a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4L15.5 7" /></template>
    <template v-else-if="nombre === 'reloj'"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></template>
    <template v-else-if="nombre === 'bandera'"><path d="M4 21V4" /><path d="M4 4h12l-2 4 2 4H4" /></template>
    <template v-else-if="nombre === 'anuncio'"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" /><path d="M16 9a4 4 0 0 1 0 6" /></template>
    <template v-else-if="nombre === 'menu'"><path d="M4 6h16M4 12h16M4 18h16" /></template>
    <template v-else-if="nombre === 'cerrar'"><path d="M6 6l12 12M18 6 6 18" /></template>
    <template v-else-if="nombre === 'colapsar'"><path d="m11 17-5-5 5-5" /><path d="m18 17-5-5 5-5" /></template>
    <template v-else-if="nombre === 'atras'"><path d="m15 18-6-6 6-6" /></template>
    <template v-else-if="nombre === 'mas'"><path d="M12 5v14M5 12h14" /></template>
    <template v-else-if="nombre === 'buscar'"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></template>
    <template v-else-if="nombre === 'limpiar'"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></template>
    <template v-else-if="nombre === 'filtro'"><path d="M3 5h18l-7 8.5V19l-4 2v-7.5L3 5Z" /></template>
    <template v-else-if="nombre === 'descargar'"><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M4 20h16" /></template>
    <template v-else-if="nombre === 'subir'"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></template>
    <template v-else-if="nombre === 'calendario'"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></template>
    <template v-else-if="nombre === 'documento'"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" /><path d="M14 3v6h6" /></template>
    <template v-else-if="nombre === 'lapiz'"><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></template>
    <template v-else-if="nombre === 'bloquear'"><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></template>
    <template v-else-if="nombre === 'sync'"><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /></template>
    <template v-else-if="nombre === 'enviar'"><path d="M4 12 20 4l-4 16-4-7-8-1Z" /><path d="m12 13 8-9" /></template>
    <template v-else-if="nombre === 'abajo'"><path d="m6 9 6 6 6-6" /></template>
  </svg>
</template>

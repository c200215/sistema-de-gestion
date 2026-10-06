<script setup lang="ts">
const { aviso, cerrar } = useAviso()

function deshacer() {
  aviso.value?.deshacer?.()
  cerrar()
}
</script>

<template>
  <Transition enter-from-class="translate-y-4 opacity-0" leave-to-class="translate-y-4 opacity-0" enter-active-class="transition" leave-active-class="transition">
    <div v-if="aviso" role="status" class="fixed bottom-4 left-4 right-4 z-110 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl sm:bottom-6 sm:left-auto sm:right-6">
      <span>{{ aviso.texto }}</span>
      <button v-if="aviso.deshacer" type="button" class="ml-2 font-semibold text-teal-300 hover:text-teal-200" @click="deshacer">Deshacer</button>
    </div>
  </Transition>
</template>

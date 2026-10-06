<script setup lang="ts">
import type { Trabajo } from '~/data/trabajos'
const props=defineProps<{trabajo:Trabajo}>()
const {ejecutar,pendiente}=useAcciones()
const equipo=useEquipo()
const abierto=ref(false)
const form=reactive({titulo:'',descripcion:'',asignado:'',fecha:''})
async function guardar() {
  if(await ejecutar('crear-tarea',{...form,fecha:form.fecha||'Sin fecha'},props.trabajo.codigo)) {
    abierto.value=false
    Object.assign(form,{titulo:'',descripcion:'',asignado:'',fecha:''})
  }
}
</script>
<template>
  <button type="button" class="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white" @click="abierto=true">Crear tarea</button>
  <UiModal :open="abierto" title="Crear tarea" description="Asigna la tarea a un integrante del equipo." @close="abierto=false">
    <form class="flex flex-col gap-4" @submit.prevent="guardar">
      <label>Título<input v-model="form.titulo" required maxlength="250" class="block w-full rounded border p-2"></label>
      <label>Descripción<textarea v-model="form.descripcion" required maxlength="5000" class="block w-full rounded border p-2" /></label>
      <label>Asignado a<select v-model="form.asignado" required class="block w-full rounded border p-2"><option value="" disabled>Seleccionar</option><option v-for="p in equipo.filter(p=>p.activo && p.perfil==='Trabajador')" :key="p.id" :value="p.nombre">{{p.nombre}}</option></select></label>
      <label>Fecha límite<input v-model="form.fecha" type="date" class="block w-full rounded border p-2"></label>
      <button :disabled="pendiente" class="rounded-xl bg-teal-700 p-3 text-white">Guardar tarea</button>
    </form>
  </UiModal>
</template>

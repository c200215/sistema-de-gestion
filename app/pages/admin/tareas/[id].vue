<script setup lang="ts">
const { ejecutar } = useAcciones()
const { subir } = useAdjuntos()
definePageMeta({ layout: 'admin' })

const route = useRoute()
const { buscarTarea } = useTrabajos()
const { mostrar } = useAviso()
const yo = useSesion().value.nombre

const encontrado = computed(() => buscarTarea(String(route.params.id)))
const tarea = computed(() => encontrado.value?.tarea ?? null)
const trabajo = computed(() => encontrado.value?.trabajo ?? null)
useHead(() => ({ title: `${tarea.value?.titulo ?? 'Tarea'} · Ignite LATAM Gestión` }))

const observacion = ref('')
const vencida = computed(() => !!tarea.value?.vencida && tarea.value.estado !== 'Terminado')

async function enviar() {
  if(!tarea.value || !trabajo.value || !observacion.value.trim()) return
  if(await ejecutar('avance',{texto:observacion.value},trabajo.value.codigo,tarea.value.id)) { observacion.value=''; mostrar('Observación guardada') }
}
</script>

<template>
  <div v-if="!tarea || !trabajo" class="py-20 text-center">
    <p class="text-lg font-semibold text-slate-900">No encontramos esa tarea</p>
    <NuxtLink to="/admin/trabajos" class="mt-3 inline-block text-sm font-medium text-teal-700 hover:text-blue-800">Volver a Trabajos</NuxtLink>
  </div>

  <div v-else>
    <nav class="flex flex-wrap items-center gap-1 text-sm text-slate-500">
      <NuxtLink to="/admin/trabajos" class="inline-flex items-center gap-1 font-medium transition hover:text-teal-700">
        <UiIcono nombre="atras" clase="h-4 w-4" grosor="2" />
        Trabajos
      </NuxtLink>
      <span class="text-slate-300">/</span>
      <NuxtLink :to="`/admin/trabajos/${trabajo.codigo}`" class="truncate font-medium transition hover:text-teal-700">{{ trabajo.codigo }} · {{ trabajo.titulo }}</NuxtLink>
    </nav>

    <div class="mt-4">
      <p class="text-sm text-slate-400">Tarea de {{ trabajo.codigo }} · {{ trabajo.tipo }}</p>
      <h1 class="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">{{ tarea.titulo }}</h1>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <UiEtiqueta :texto="tarea.estado" :clases="clasesEstado[tarea.estado]" />
        <UiEtiqueta v-if="vencida" texto="Vencida" :clases="clasesVencido" />
        <UiEtiqueta v-if="tarea.estado === 'Terminado' && !tarea.documentos.length" texto="Terminada sin respaldo" :clases="clasesAdvertencia" />
      </div>
    </div>

    <div class="mt-6 grid grid-cols-1 items-start gap-4 md:mt-8 md:gap-6 xl:grid-cols-3">
      <div class="flex flex-col gap-4 md:gap-6 xl:col-span-2">
        <UiPanelCard title="Descripción">
          <p class="px-4 py-5 text-sm leading-relaxed text-slate-700 md:px-6">{{ tarea.descripcion }}</p>
        </UiPanelCard>

        <UiPanelCard title="Respaldo del cumplimiento" description="Documentos subidos por la persona asignada.">
          <template #actions>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{{ plural(tarea.documentos.length, 'documento', 'documentos') }}</span>
          </template>
          <ul class="divide-y divide-slate-100">
            <FilaDocumento v-for="(d, i) in tarea.documentos" :key="i" :documento="d" />
            <li v-if="!tarea.documentos.length" class="px-4 py-8 text-center text-sm text-slate-400 md:px-6">{{ tarea.asignado }} aún no adjunta respaldos.</li>
          </ul>
        </UiPanelCard>

        <UiPanelCard title="Avances y observaciones" description="Puedes dejar una observación para la persona asignada.">
          <form class="flex flex-col gap-3 border-b border-slate-100 px-4 py-5 md:px-6" @submit.prevent="enviar">
            <label>
              <span class="sr-only">Escribe una observación</span>
              <textarea v-model="observacion" rows="3" required placeholder="Ej: Falta adjuntar la prueba de conexión antes de dar la tarea por terminada" class="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />
            </label>
            <button type="submit" class="self-end rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700">Enviar observación</button>
          </form>
          <ul class="divide-y divide-slate-100">
            <FilaComentario v-for="(a, i) in tarea.avances" :key="i" :entrada="a" :yo="yo" />
            <li v-if="!tarea.avances.length" class="px-4 py-8 text-center text-sm text-slate-400 md:px-6">Todavía no hay avances registrados.</li>
          </ul>
        </UiPanelCard>
      </div>

      <div class="flex flex-col gap-4 md:gap-6">
        <UiPanelCard title="Estado">
          <div class="px-4 py-5 md:px-6">
            <UiEtiqueta :texto="tarea.estado" :clases="clasesEstado[tarea.estado]" />
            <p class="mt-3 text-xs text-slate-500">Solo {{ tarea.asignado }} puede cambiar el estado de esta tarea.</p>
          </div>
        </UiPanelCard>

        <UiPanelCard title="Detalles">
          <dl class="flex flex-col gap-4 px-4 py-5 text-sm md:px-6">
            <div>
              <dt class="text-xs font-medium text-slate-500">Trabajo</dt>
              <dd class="mt-0.5"><NuxtLink :to="`/admin/trabajos/${trabajo.codigo}`" class="font-medium text-teal-700 hover:text-blue-800">{{ trabajo.codigo }} · {{ trabajo.titulo }}</NuxtLink></dd>
            </div>
            <div><dt class="text-xs font-medium text-slate-500">Asignada a</dt><dd class="mt-0.5 text-slate-900">{{ tarea.asignado }}</dd></div>
            <div><dt class="text-xs font-medium text-slate-500">Responsable principal</dt><dd class="mt-0.5 text-slate-900">{{ trabajo.responsable }}</dd></div>
            <div><dt class="text-xs font-medium text-slate-500">Fecha límite</dt><dd class="mt-0.5" :class="vencida ? 'font-semibold text-rose-600' : 'text-slate-900'">{{ tarea.fecha }}</dd></div>
            <div><dt class="text-xs font-medium text-slate-500">Creada</dt><dd class="mt-0.5 text-slate-900">{{ tarea.creada }}</dd></div>
            <div><dt class="text-xs font-medium text-slate-500">Última actualización</dt><dd class="mt-0.5 text-slate-900">{{ tarea.actualizada }}</dd></div>
          </dl>
        </UiPanelCard>

        <UiPanelCard title="Historial de la tarea">
          <ListaHistorial :eventos="tarea.historial" />
        </UiPanelCard>
      </div>
    </div>
  </div>
</template>

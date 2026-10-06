<script setup lang="ts">
const { ejecutar } = useAcciones()
const { subir } = useAdjuntos()
definePageMeta({ layout: 'trabajador' })

const route = useRoute()
const yo = useSesion().value.nombre
const { trabajos } = useTrabajos()
const { mostrar } = useAviso()

const trabajo = computed(() => {
  const t = trabajos.value[String(route.params.codigo)]
  return t && (t.responsable === yo || t.tareas.some((x) => x.asignado === yo)) ? t : null
})
useHead(() => ({ title: `${trabajo.value?.codigo ?? 'Trabajo'} · Ignite LATAM Gestión` }))

const comentario = ref('')
const terminadas = computed(() => trabajo.value?.tareas.filter((t) => t.estado === 'Terminado').length ?? 0)

const documentos = computed(() => trabajo.value
  ? [
      ...trabajo.value.documentos.map((documento) => ({ documento, origen: 'Documento del trabajo' })),
      ...trabajo.value.tareas.flatMap((t) => t.documentos.map((documento) => ({ documento, origen: `Tarea: ${t.titulo}` }))),
    ]
  : [])

function registrar(texto: string) {
  trabajo.value?.historial.unshift({ texto, fecha: 'Ahora' })
}

async function publicar() {
      if(!comentario.value.trim() || !trabajo.value) return
      if(await ejecutar('comentario',{texto:comentario.value},trabajo.value.codigo)) { comentario.value=''; mostrar('Comentario guardado') }
    }

async function adjuntar(e: Event) {
      const campo=e.target as HTMLInputElement
      if(trabajo.value) await subir([...(campo.files??[])],trabajo.value.codigo)
      campo.value=''
    }
</script>

<template>
  <div v-if="!trabajo" class="py-20 text-center">
    <p class="text-lg font-semibold text-slate-900">No tienes acceso a este trabajo</p>
    <p class="mt-1 text-sm text-slate-500">Solo puedes ver los trabajos donde tienes tareas asignadas.</p>
    <NuxtLink to="/trabajador/mis-trabajos" class="mt-3 inline-block text-sm font-medium text-teal-700 hover:text-blue-800">Volver a Mis trabajos</NuxtLink>
  </div>

  <div v-else>
    <NuxtLink to="/trabajador/mis-trabajos" class="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-teal-700">
      <UiIcono nombre="atras" clase="h-4 w-4" grosor="2" />
      Mis trabajos
    </NuxtLink>

    <div class="mt-4">
      <p class="text-sm text-slate-400">{{ trabajo.codigo }} · {{ trabajo.tipo }}</p>
      <h1 class="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">{{ trabajo.titulo }}</h1>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <UiEtiqueta :texto="trabajo.prioridad" :clases="clasesPrioridad[trabajo.prioridad]" />
        <UiEtiqueta :texto="trabajo.estado" :clases="clasesEstado[trabajo.estado]" />
        <UiEtiqueta v-if="trabajo.vencido && trabajo.estado !== 'Terminado'" texto="Vencido" :clases="clasesVencido" />
      </div>
    </div>

    <div class="mt-6 grid grid-cols-1 items-start gap-4 md:mt-8 md:gap-6 xl:grid-cols-3">
      <div class="flex flex-col gap-4 md:gap-6 xl:col-span-2">
        <UiPanelCard title="Descripción">
          <p class="px-4 py-5 text-sm leading-relaxed text-slate-700 md:px-6">{{ trabajo.descripcion }}</p>
        </UiPanelCard>

        <UiPanelCard title="Tareas">
          <template #actions>
            <div class="flex items-center gap-3">
              <p class="text-sm text-slate-500">{{ terminadas }} de {{ trabajo.tareas.length }} terminadas</p>
              <div class="hidden h-1.5 w-24 rounded-full bg-slate-100 sm:block">
                <div class="h-1.5 rounded-full bg-linear-to-r from-teal-600 to-blue-800" :style="{ width: `${trabajo.tareas.length ? (terminadas * 100) / trabajo.tareas.length : 0}%` }" />
              </div>
            </div>
          </template>
          <ul class="divide-y divide-slate-100">
            <li v-for="t in trabajo.tareas" :key="t.id" class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start md:px-6" :class="t.asignado === yo ? 'bg-teal-50/40' : ''">
              <div class="min-w-0 flex-1">
                <NuxtLink :to="`/trabajador/tareas/${t.id}`" class="font-semibold text-slate-900 hover:text-teal-700" :class="t.estado === 'Terminado' ? 'line-through decoration-slate-300' : ''">{{ t.titulo }}</NuxtLink>
                <p class="mt-0.5 text-sm text-slate-500">{{ t.descripcion }}</p>
                <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span class="flex items-center gap-1.5" :class="t.asignado === yo ? 'font-semibold text-teal-700' : 'text-slate-500'">
                    <span class="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold" :class="t.asignado === yo ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'">{{ iniciales(t.asignado) }}</span>
                    {{ t.asignado === yo ? 'Asignada a ti' : t.asignado }}
                  </span>
                  <span :class="t.vencida && t.estado !== 'Terminado' ? 'font-semibold text-rose-600' : 'text-slate-500'">{{ t.vencida && t.estado !== 'Terminado' ? 'Venció el' : 'Vence el' }} {{ t.fecha }}</span>
                  <span :class="t.documentos.length ? 'text-teal-700' : 'text-slate-400'">{{ plural(t.documentos.length, 'respaldo', 'respaldos') }}</span>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-3">
                <UiEtiqueta :texto="t.estado" :clases="clasesEstado[t.estado]" />
                <NuxtLink :to="`/trabajador/tareas/${t.id}`" class="text-sm font-medium text-teal-700 hover:text-blue-800">{{ t.asignado === yo ? 'Abrir' : 'Ver' }}</NuxtLink>
              </div>
            </li>
          </ul>
        </UiPanelCard>

        <UiPanelCard title="Comentarios y avances">
          <form class="flex flex-col gap-3 border-b border-slate-100 px-4 py-5 md:px-6" @submit.prevent="publicar">
            <label>
              <span class="sr-only">Escribe un comentario</span>
              <textarea v-model="comentario" rows="3" required placeholder="Registra un avance, una acción realizada o una observación" class="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />
            </label>
            <button type="submit" class="self-end rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700">Publicar</button>
          </form>
          <ul class="divide-y divide-slate-100">
            <FilaComentario v-for="(c, i) in trabajo.comentarios" :key="i" :entrada="c" :yo="yo" />
            <li v-if="!trabajo.comentarios.length" class="px-4 py-8 text-center text-sm text-slate-400 md:px-6">Todavía no hay comentarios.</li>
          </ul>
        </UiPanelCard>
      </div>

      <div class="flex flex-col gap-4 md:gap-6">
        <UiPanelCard title="Detalles">
          <dl class="flex flex-col gap-4 px-4 py-5 text-sm md:px-6">
            <div><dt class="text-xs font-medium text-slate-500">Cliente o área</dt><dd class="mt-0.5 text-slate-900">{{ trabajo.cliente }}</dd></div>
            <div><dt class="text-xs font-medium text-slate-500">Correo de contacto</dt><dd class="mt-0.5 break-words text-slate-900">{{ trabajo.contacto }}</dd></div>
            <div><dt class="text-xs font-medium text-slate-500">Canal de origen</dt><dd class="mt-0.5 text-slate-900">{{ trabajo.canal }}</dd></div>
            <div><dt class="text-xs font-medium text-slate-500">Jefe responsable</dt><dd class="mt-0.5 text-slate-900">{{ trabajo.responsable }}</dd></div>
            <div><dt class="text-xs font-medium text-slate-500">Fecha límite</dt><dd class="mt-0.5" :class="trabajo.vencido && trabajo.estado !== 'Terminado' ? 'font-semibold text-rose-600' : 'text-slate-900'">{{ trabajo.fecha }}</dd></div>
          </dl>
          <p class="px-4 pb-5 text-xs text-slate-400 md:px-6">Tú puedes actualizar el estado de las tareas asignadas a ti, comentar y adjuntar documentos.</p>
        </UiPanelCard>

        <UiPanelCard title="Documentos">
          <template #actions>
            <label class="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-teal-700 transition hover:text-blue-800">
              <UiIcono nombre="mas" clase="h-4 w-4" grosor="2.5" />
              Adjuntar
              <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" class="sr-only" @change="adjuntar">
            </label>
          </template>
          <ul class="divide-y divide-slate-100">
            <FilaDocumento v-for="(d, i) in documentos" :key="i" :documento="d.documento" :origen="d.origen" />
            <li v-if="!documentos.length" class="px-4 py-8 text-center text-sm text-slate-400 md:px-6">Sin documentos adjuntos.</li>
          </ul>
        </UiPanelCard>

        <UiPanelCard title="Historial">
          <ListaHistorial :eventos="trabajo.historial" />
        </UiPanelCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { ejecutar } = useAcciones()
const { subir } = useAdjuntos()
import type { Estado } from '~/data/trabajos'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { trabajos } = useTrabajos()
const { mostrar } = useAviso()
const yo = useSesion().value.nombre

const trabajo = computed(() => trabajos.value[String(route.params.codigo)] ?? null)
useHead(() => ({ title: `${trabajo.value?.codigo ?? 'Trabajo'} · Ignite LATAM Gestión` }))

const comentario = ref('')

const terminadas = computed(() => trabajo.value?.tareas.filter((t) => t.estado === 'Terminado').length ?? 0)
const listoParaCerrar = computed(() => !!trabajo.value && trabajo.value.tareas.length > 0 && terminadas.value === trabajo.value.tareas.length && trabajo.value.estado !== 'Terminado')

const documentos = computed(() => trabajo.value
  ? [
      ...trabajo.value.documentos.map((documento) => ({ documento, origen: 'Documento del trabajo' })),
      ...trabajo.value.tareas.flatMap((t) => t.documentos.map((documento) => ({ documento, origen: `Respaldo de "${t.titulo}"` }))),
    ]
  : [])

const actividad = computed(() => trabajo.value
  ? [
      ...trabajo.value.comentarios.map((entrada) => ({ entrada, contexto: '' })),
      ...trabajo.value.tareas.flatMap((t) => t.avances.map((entrada) => ({ entrada, contexto: `Avance en la tarea "${t.titulo}"` }))),
    ]
  : [])

function registrar(texto: string) {
  trabajo.value?.historial.unshift({ texto, fecha: 'Ahora' })
}

async function cambiarEstado(nuevo: Estado) {
      if(trabajo.value && await ejecutar('estado-trabajo',{estado:nuevo},trabajo.value.codigo)) mostrar('Estado guardado')
    }

async function publicar() {
      if(!comentario.value.trim() || !trabajo.value) return
      if(await ejecutar('comentario',{texto:comentario.value},trabajo.value.codigo)) { comentario.value=''; mostrar('Comentario guardado') }
    }

const detalles = computed(() => trabajo.value
  ? [
      ['Cliente o área', trabajo.value.cliente],
      ['Correo de contacto', trabajo.value.contacto],
      ['Canal de origen', trabajo.value.canal],
      ['Responsable principal', trabajo.value.responsable],
      ['Fecha límite', trabajo.value.fecha],
    ]
  : [])
</script>

<template>
  <div v-if="!trabajo" class="py-20 text-center">
    <p class="text-lg font-semibold text-slate-900">No encontramos ese trabajo</p>
    <NuxtLink to="/admin/trabajos" class="mt-3 inline-block text-sm font-medium text-teal-700 hover:text-blue-800">Volver a Trabajos</NuxtLink>
  </div>

  <div v-else>
    <NuxtLink to="/admin/trabajos" class="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-teal-700">
      <UiIcono nombre="atras" clase="h-4 w-4" grosor="2" />
      Trabajos
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

    <div v-if="listoParaCerrar" class="mt-6 flex flex-col justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-4 sm:flex-row sm:items-center md:px-5">
      <div class="flex items-start gap-3">
        <UiIcono nombre="check" clase="mt-0.5 h-5 w-5 shrink-0 text-teal-700" grosor="2.5" />
        <div>
          <p class="font-semibold text-slate-900">Todas las tareas están terminadas</p>
          <p class="text-sm text-slate-600">Revisa los respaldos adjuntos y, si todo está conforme, marca el trabajo como terminado.</p>
        </div>
      </div>
      <button type="button" class="shrink-0 rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700" @click="cambiarEstado('Terminado')">Marcar como terminado</button>
    </div>

    <div class="mt-6 grid grid-cols-1 items-start gap-4 md:mt-8 md:gap-6 xl:grid-cols-3">
      <div class="flex flex-col gap-4 md:gap-6 xl:col-span-2">
        <UiPanelCard title="Descripción">
          <p class="px-4 py-5 text-sm leading-relaxed text-slate-700 md:px-6">{{ trabajo.descripcion }}</p>
        </UiPanelCard>

        <UiPanelCard title="Tareas">
          <template #actions>
            <GestionTareas :trabajo="trabajo" />
            <div class="flex items-center gap-3">
              <p class="text-sm text-slate-500">{{ terminadas }} de {{ trabajo.tareas.length }} terminadas</p>
              <div class="hidden h-1.5 w-24 rounded-full bg-slate-100 sm:block">
                <div class="h-1.5 rounded-full bg-linear-to-r from-teal-600 to-blue-800" :style="{ width: `${trabajo.tareas.length ? (terminadas * 100) / trabajo.tareas.length : 0}%` }" />
              </div>
            </div>
          </template>
          <ul class="divide-y divide-slate-100">
            <li v-for="t in trabajo.tareas" :key="t.id" class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start md:px-6">
              <div class="min-w-0 flex-1">
                <NuxtLink :to="`/admin/tareas/${t.id}`" class="font-semibold text-slate-900 hover:text-teal-700">{{ t.titulo }}</NuxtLink>
                <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span class="flex items-center gap-1.5 text-slate-600">
                    <span class="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">{{ iniciales(t.asignado) }}</span>
                    {{ t.asignado }}
                  </span>
                  <span :class="t.vencida && t.estado !== 'Terminado' ? 'font-semibold text-rose-600' : 'text-slate-500'">{{ t.vencida && t.estado !== 'Terminado' ? 'Venció el' : 'Vence el' }} {{ t.fecha }}</span>
                  <span v-if="t.estado === 'Terminado' && !t.documentos.length" class="font-medium text-amber-700">Terminada sin respaldo</span>
                  <span v-else :class="t.documentos.length ? 'text-teal-700' : 'text-slate-400'">{{ plural(t.documentos.length, 'respaldo', 'respaldos') }}</span>
                  <span class="text-slate-400">{{ plural(t.avances.length, 'avance', 'avances') }}</span>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-3">
                <UiEtiqueta :texto="t.estado" :clases="clasesEstado[t.estado]" />
                <NuxtLink :to="`/admin/tareas/${t.id}`" class="text-sm font-medium text-teal-700 hover:text-blue-800">Revisar</NuxtLink>
              </div>
            </li>
            <li v-if="!trabajo.tareas.length" class="px-4 py-8 text-center text-sm text-slate-400 md:px-6">Este trabajo todavía no tiene tareas.</li>
          </ul>
        </UiPanelCard>

        <UiPanelCard title="Comentarios y avances" description="Incluye los avances registrados en cada tarea.">
          <form class="flex flex-col gap-3 border-b border-slate-100 px-4 py-5 md:px-6" @submit.prevent="publicar">
            <label>
              <span class="sr-only">Escribe un comentario</span>
              <textarea v-model="comentario" rows="3" required placeholder="Deja una indicación o una observación para el equipo" class="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />
            </label>
            <button type="submit" class="self-end rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700">Publicar</button>
          </form>
          <ul class="divide-y divide-slate-100">
            <FilaComentario v-for="(a, i) in actividad" :key="i" :entrada="a.entrada" :contexto="a.contexto" :yo="yo" />
            <li v-if="!actividad.length" class="px-4 py-8 text-center text-sm text-slate-400 md:px-6">Todavía no hay comentarios ni avances.</li>
          </ul>
        </UiPanelCard>
      </div>

      <div class="flex flex-col gap-4 md:gap-6">
        <UiPanelCard title="Estado del trabajo">
          <div class="px-4 py-5 md:px-6">
            <div class="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
              <button
                v-for="e in ESTADOS"
                :key="e"
                type="button"
                class="rounded-lg px-2 py-2 text-xs font-medium transition sm:text-sm"
                :class="trabajo.estado === e ? 'bg-linear-to-r from-teal-600 to-blue-800 text-white shadow' : 'text-slate-600 hover:bg-white'"
                @click="cambiarEstado(e)"
              >{{ e }}</button>
            </div>
            <p class="mt-3 text-xs text-slate-500">Es independiente del avance de las tareas y no cambia solo al terminarlas.</p>
          </div>
        </UiPanelCard>

        <UiPanelCard title="Detalles">
          <dl class="flex flex-col gap-4 px-4 py-5 text-sm md:px-6">
            <div v-for="[clave, valor] in detalles" :key="clave">
              <dt class="text-xs font-medium text-slate-500">{{ clave }}</dt>
              <dd class="mt-0.5 break-words text-slate-900" :class="clave === 'Fecha límite' && trabajo.vencido && trabajo.estado !== 'Terminado' ? 'font-semibold text-rose-600' : ''">{{ valor }}</dd>
            </div>
          </dl>
        </UiPanelCard>

        <UiPanelCard title="Documentos">
          <template #actions>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{{ documentos.length }}</span>
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

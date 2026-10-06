<script setup lang="ts">
const { ejecutar } = useAcciones()
const { subir } = useAdjuntos()
import type { Estado } from '~/data/trabajos'

definePageMeta({ layout: 'trabajador' })

const route = useRoute()
const yo = useSesion().value.nombre
const { buscarTarea } = useTrabajos()
const { mostrar } = useAviso()

const encontrado = computed(() => {
  const e = buscarTarea(String(route.params.id))
  return e && e.trabajo.tareas.some((t) => t.asignado === yo) ? e : null
})
const tarea = computed(() => encontrado.value?.tarea ?? null)
const trabajo = computed(() => encontrado.value?.trabajo ?? null)
useHead(() => ({ title: `${tarea.value?.titulo ?? 'Tarea'} · Ignite LATAM Gestión` }))

const esMia = computed(() => tarea.value?.asignado === yo)
const vencida = computed(() => !!tarea.value?.vencida && tarea.value.estado !== 'Terminado')
const avance = ref('')
const modalTerminar = ref(false)
const zona = ref<{ abrir: () => void } | null>(null)

function registrar(texto: string) {
  if (!tarea.value) return
  tarea.value.historial.unshift({ texto, fecha: 'Ahora' })
  tarea.value.actualizada = 'Ahora'
}

async function cambiarEstado(nuevo: Estado) {
    if(tarea.value && trabajo.value && await ejecutar('estado-tarea',{estado:nuevo},trabajo.value.codigo,tarea.value.id)) mostrar('Estado guardado')
  }

function pedirEstado(nuevo: Estado) {
  if (nuevo === 'Terminado' && !tarea.value?.documentos.length) {
    modalTerminar.value = true
    return
  }
  cambiarEstado(nuevo)
}

function terminarIgual() {
  modalTerminar.value = false
  cambiarEstado('Terminado')
}

function adjuntarAhora() {
  modalTerminar.value = false
  zona.value?.abrir()
}

async function agregarArchivos(archivos: File[]) {
    if(tarea.value && trabajo.value) await subir(archivos,trabajo.value.codigo,tarea.value.id)
  }

async function quitar(indice: number) {
    if(tarea.value && trabajo.value) await ejecutar('quitar-documento',{id:(tarea.value.documentos[indice] as any)?.id},trabajo.value.codigo,tarea.value.id)
  }

async function registrarAvance() {
    if(!tarea.value || !trabajo.value || !avance.value.trim()) return
    if(await ejecutar('avance',{texto:avance.value},trabajo.value.codigo,tarea.value.id)) { avance.value=''; mostrar('Avance guardado') }
  }
</script>

<template>
  <div v-if="!tarea || !trabajo" class="py-20 text-center">
    <p class="text-lg font-semibold text-slate-900">No tienes acceso a esta tarea</p>
    <NuxtLink to="/trabajador/mis-tareas" class="mt-3 inline-block text-sm font-medium text-teal-700 hover:text-blue-800">Volver a Mis tareas</NuxtLink>
  </div>

  <div v-else>
    <nav class="flex flex-wrap items-center gap-1 text-sm text-slate-500">
      <NuxtLink to="/trabajador/mis-tareas" class="inline-flex items-center gap-1 font-medium transition hover:text-teal-700">
        <UiIcono nombre="atras" clase="h-4 w-4" grosor="2" />
        Mis tareas
      </NuxtLink>
      <span class="text-slate-300">/</span>
      <NuxtLink :to="`/trabajador/trabajos/${trabajo.codigo}`" class="truncate font-medium transition hover:text-teal-700">{{ trabajo.codigo }} · {{ trabajo.titulo }}</NuxtLink>
    </nav>

    <div class="mt-4">
      <p class="text-sm text-slate-400">Tarea de {{ trabajo.codigo }} · {{ trabajo.tipo }}</p>
      <h1 class="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">{{ tarea.titulo }}</h1>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <UiEtiqueta :texto="tarea.estado" :clases="clasesEstado[tarea.estado]" />
        <UiEtiqueta v-if="vencida" texto="Vencida" :clases="clasesVencido" />
        <UiEtiqueta v-if="esMia" texto="Asignada a ti" :clases="clasesPositivo" />
      </div>
    </div>

    <div class="mt-6 grid grid-cols-1 items-start gap-4 md:mt-8 md:gap-6 xl:grid-cols-3">
      <div class="flex flex-col gap-4 md:gap-6 xl:col-span-2">
        <UiPanelCard title="Descripción">
          <p class="px-4 py-5 text-sm leading-relaxed text-slate-700 md:px-6">{{ tarea.descripcion }}</p>
        </UiPanelCard>

        <UiPanelCard title="Respaldo del cumplimiento" description="Documentos que acreditan el trabajo realizado en esta tarea.">
          <template #actions>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{{ plural(tarea.documentos.length, 'documento', 'documentos') }}</span>
          </template>
          <div v-if="esMia" class="px-4 pt-5 md:px-6">
            <ZonaCarga ref="zona" @archivos="agregarArchivos" />
          </div>
          <ul class="divide-y divide-slate-100" :class="esMia ? 'mt-5 border-t border-slate-100' : ''">
            <FilaDocumento v-for="(d, i) in tarea.documentos" :key="d.nombre + i" :documento="d" :puede-quitar="esMia && d.autor === yo" @quitar="quitar(i)" />
            <li v-if="!tarea.documentos.length" class="px-4 py-8 text-center text-sm text-slate-400 md:px-6">{{ esMia ? 'Aún no adjuntas respaldos para esta tarea.' : 'Esta tarea no tiene documentos adjuntos.' }}</li>
          </ul>
        </UiPanelCard>

        <UiPanelCard title="Avances" description="Registra lo que hiciste, lo que falta o cualquier observación.">
          <form v-if="esMia" class="flex flex-col gap-3 border-b border-slate-100 px-4 py-5 md:px-6" @submit.prevent="registrarAvance">
            <label>
              <span class="sr-only">Escribe un avance</span>
              <textarea v-model="avance" rows="3" required placeholder="Ej: Configuré las reglas del firewall y probé la conexión desde el servidor nuevo" class="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />
            </label>
            <button type="submit" class="self-end rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700">Registrar avance</button>
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
            <div class="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
              <button
                v-for="e in ESTADOS"
                :key="e"
                type="button"
                :disabled="!esMia"
                class="rounded-lg px-2 py-2 text-xs font-medium transition sm:text-sm"
                :class="tarea.estado === e ? 'bg-linear-to-r from-teal-600 to-blue-800 text-white shadow' : 'text-slate-600 enabled:hover:bg-white disabled:cursor-not-allowed'"
                @click="pedirEstado(e)"
              >{{ e }}</button>
            </div>
            <p class="mt-3 text-xs text-slate-500">{{ esMia ? 'Solo tú puedes cambiar el estado de esta tarea.' : `Solo ${tarea.asignado} puede cambiar el estado de esta tarea.` }}</p>
          </div>
        </UiPanelCard>

        <UiPanelCard title="Detalles">
          <dl class="flex flex-col gap-4 px-4 py-5 text-sm md:px-6">
            <div>
              <dt class="text-xs font-medium text-slate-500">Trabajo</dt>
              <dd class="mt-0.5"><NuxtLink :to="`/trabajador/trabajos/${trabajo.codigo}`" class="font-medium text-teal-700 hover:text-blue-800">{{ trabajo.codigo }} · {{ trabajo.titulo }}</NuxtLink></dd>
            </div>
            <div><dt class="text-xs font-medium text-slate-500">Asignada a</dt><dd class="mt-0.5 text-slate-900">{{ tarea.asignado }}{{ esMia ? ' (tú)' : '' }}</dd></div>
            <div><dt class="text-xs font-medium text-slate-500">Jefe responsable</dt><dd class="mt-0.5 text-slate-900">{{ trabajo.responsable }}</dd></div>
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

    <UiModal :open="modalTerminar" title="¿Terminar sin respaldo?" max-width="max-w-md" @close="modalTerminar = false">
      <p class="text-sm leading-relaxed text-slate-600">Esta tarea no tiene documentos que acrediten su cumplimiento. Te recomendamos adjuntar al menos uno antes de marcarla como terminada.</p>
      <template #footer>
        <button type="button" class="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100" @click="terminarIgual">Terminar igual</button>
        <button type="button" class="rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700" @click="adjuntarAhora">Adjuntar respaldo</button>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
const { ejecutar } = useAcciones()
const { subir } = useAdjuntos()
import type { Estado, Tarea, Trabajo } from '~/data/trabajos'
import { VueDraggable, type DraggableEvent } from 'vue-draggable-plus'

definePageMeta({ layout: 'trabajador' })
useHead({ title: 'Mis tareas · Ignite LATAM Gestión' })

const yo = useSesion().value.nombre
const { tareasDe } = useTrabajos()
const { mostrar } = useAviso()

interface TareaAsignada { tarea: Tarea, trabajo: Trabajo }
interface Columna {
  estado: Estado
  titulo: string
  punto: string
  vacio: string
  tareas: TareaAsignada[]
}

const columnas = reactive<Columna[]>([
  { estado: 'Pendiente', titulo: 'Pendientes', punto: 'bg-amber-500', vacio: 'No tienes tareas pendientes.', tareas: [] },
  { estado: 'En curso', titulo: 'En curso', punto: 'bg-blue-700', vacio: 'No tienes tareas en curso.', tareas: [] },
  { estado: 'Terminado', titulo: 'Terminadas', punto: 'bg-teal-600', vacio: 'Arrastra aquí las tareas que termines.', tareas: [] },
])

const mias = computed(() => tareasDe(yo))
let recienArrastrada = false

function sincronizarColumnas() {
    for(const col of columnas) col.tareas=mias.value.filter(x=>x.tarea.estado===col.estado)
  }
  watch(mias,sincronizarColumnas,{immediate:true})
  function alIniciar() {
  recienArrastrada = true
}

async function alSoltar(evento: DraggableEvent<TareaAsignada>) {
    const id=Number(evento.item.dataset.id)
    const col=columnas.find(c=>c.tareas.some(x=>x.tarea.id===id))
    const item=col?.tareas.find(x=>x.tarea.id===id)
    if(col && item && item.tarea.estado!==col.estado) await ejecutar('estado-tarea',{estado:col.estado},item.trabajo.codigo,id)
    sincronizarColumnas()
    setTimeout(()=>recienArrastrada=false,0)
  }

function abrir(tarea: Tarea, e: MouseEvent) {
  if (recienArrastrada || (e.target as HTMLElement).closest('a, [data-asa]')) return
  navigateTo(`/trabajador/tareas/${tarea.id}`)
}

function claseTarjeta(tarea: Tarea) {
  return tarea.vencida && tarea.estado !== 'Terminado' ? 'border-rose-200' : 'border-slate-200'
}

function enlaceTrabajo(trabajo: Trabajo) {
  return `/trabajador/trabajos/${trabajo.codigo}`
}
</script>

<template>
  <div>
    <UiPageHeading title="Mis tareas" description="Arrastra las tarjetas desde el ícono de puntos para actualizar su estado y ábrelas para adjuntar el respaldo de lo realizado." />

    <section class="mt-6 grid grid-cols-1 items-start gap-4 md:mt-8 md:gap-6 lg:grid-cols-3">
      <div
        v-for="col in columnas"
        :key="col.estado"
        :data-zona="col.estado"
        class="rounded-2xl border border-slate-200 bg-slate-100/70 transition"
      >
        <div class="flex items-center justify-between px-4 py-3.5">
          <p class="flex items-center gap-2 font-semibold text-slate-900"><span class="h-2 w-2 rounded-full" :class="col.punto" />{{ col.titulo }}</p>
          <span class="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">{{ col.tareas.length }}</span>
        </div>

        <VueDraggable
          v-model="col.tareas"
          tag="ul"
          :group="{ name: 'tareas' }"
          :animation="150"
          :empty-insert-threshold="20"
          :draggable="'.task-card'"
          handle=".drag-handle"
          ghost-class="opacity-40"
          class="flex min-h-24 flex-col gap-3 px-3 pb-3"
          @start="alIniciar"
          @end="alSoltar"
        >
          <li
            v-for="item in col.tareas"
            :key="item.tarea.id"
            :data-id="item.tarea.id"
            class="task-card group cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:border-teal-300 hover:shadow-md active:cursor-grabbing"
            :class="claseTarjeta(item.tarea)"
            @click="abrir(item.tarea, $event)"
          >
            <TarjetaTarea :tarea="item.tarea" :trabajo="item.trabajo" :enlace="enlaceTrabajo(item.trabajo)" />
          </li>
          <li v-if="!col.tareas.length" class="rounded-xl border-2 border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">{{ col.vacio }}</li>
        </VueDraggable>
      </div>
    </section>
  </div>
</template>

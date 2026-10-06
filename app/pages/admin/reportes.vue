<script setup lang="ts">
const equipo = useEquipo()
import type { TipoTrabajo } from '~/data/trabajos'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Reportes · Ignite LATAM Gestión' })

const { trabajos } = useTrabajos()

const formulario = reactive({ desde: '', hasta: '', tipo: '', estado: '', responsable: '' })
const aplicados = reactive({ ...formulario })

function aplicar() {
  Object.assign(aplicados, formulario)
}

function limpiar() {
  Object.assign(formulario, { desde: '', hasta: '', tipo: '', estado: '', responsable: '' })
  aplicar()
}

const lista = computed(() => Object.values(trabajos.value).filter(t=>
    (!aplicados.tipo || t.tipo===aplicados.tipo) && (!aplicados.estado || t.estado===aplicados.estado)
    && (!aplicados.responsable || t.responsable===aplicados.responsable)
    && (!aplicados.desde || t.fecha>=aplicados.desde) && (!aplicados.hasta || t.fecha<=aplicados.hasta)))
const filasReporte = computed(() => equipo.value.filter(p=>p.perfil==='Trabajador'))
const filas = computed(() => filasReporte.value.map(p=>{
  const tareas=lista.value.flatMap(w=>w.tareas).filter(t=>t.asignado===p.nombre)
  const terminadas=tareas.filter(t=>t.estado==='Terminado')
  const porcentaje=tareas.length?Math.round(terminadas.length*100/tareas.length):0
  return {...p,iniciales:iniciales(p.nombre),trabajos:lista.value.filter(w=>w.responsable===p.nombre).length,asignadas:tareas.length,terminadas:terminadas.length,
    aTiempo:terminadas.filter(t=>t.fecha==='Sin fecha'||!!t.terminada&&t.terminada.slice(0,10)<=t.fecha).length,
    vencidas:tareas.filter(t=>t.vencida).length,porcentaje,color:porcentaje>=75?'text-teal-700':porcentaje>=50?'text-amber-700':'text-rose-600'}
}))

const resumen = computed(() => {
  const asignadas = filas.value.reduce((s, f) => s + f.asignadas, 0)
  const terminadas = filas.value.reduce((s, f) => s + f.terminadas, 0)
  return {
    cumplimiento: asignadas ? Math.round((terminadas * 100) / asignadas) : 0,
    asignadas,
    aTiempo: filas.value.reduce((s, f) => s + f.aTiempo, 0),
    vencidas: filas.value.reduce((s, f) => s + f.vencidas, 0),
  }
})

const periodo = computed(() => `${fechaDesdeISO(aplicados.desde) || '...'} al ${fechaDesdeISO(aplicados.hasta) || '...'}`)


const porEstado = computed(() => [
  { nombre: 'En curso', color: 'bg-blue-700', cantidad: lista.value.filter((t) => t.estado === 'En curso').length },
  { nombre: 'Pendiente', color: 'bg-amber-500', cantidad: lista.value.filter((t) => t.estado === 'Pendiente').length },
  { nombre: 'Terminado', color: 'bg-teal-600', cantidad: lista.value.filter((t) => t.estado === 'Terminado').length },
])
const tipos: { nombre: TipoTrabajo, color: string }[] = [
  { nombre: 'Proyecto', color: 'bg-teal-600' },
  { nombre: 'Soporte técnico', color: 'bg-blue-800' },
  { nombre: 'Consulta', color: 'bg-slate-300' },
]
const porTipo = computed(() => tipos.map((t) => ({ ...t, cantidad: lista.value.filter((x) => x.tipo === t.nombre).length })))

function ancho(cantidad: number) {
  return `${lista.value.length ? Math.round((cantidad * 100) / lista.value.length) : 0}%`
}

const campo = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'
const etiquetaFiltro = 'text-xs font-medium text-slate-500'
</script>

<template>
  <div>
    <UiPageHeading title="Reportes" description="Cumplimiento de tareas por trabajador y distribución de los trabajos." />

    <section class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white md:mt-8">
      <form id="form-reportes" class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:p-5 xl:grid-cols-5" @submit.prevent="aplicar">
        <label class="flex flex-col gap-1.5"><span :class="etiquetaFiltro">Desde</span><input v-model="formulario.desde" type="date" :class="campo"></label>
        <label class="flex flex-col gap-1.5"><span :class="etiquetaFiltro">Hasta</span><input v-model="formulario.hasta" type="date" :class="campo"></label>
        <label class="flex flex-col gap-1.5">
          <span :class="etiquetaFiltro">Tipo de trabajo</span>
          <select v-model="formulario.tipo" :class="campo"><option value="">Todos</option><option v-for="t in tipos" :key="t.nombre">{{ t.nombre }}</option></select>
        </label>
        <label class="flex flex-col gap-1.5">
          <span :class="etiquetaFiltro">Estado</span>
          <select v-model="formulario.estado" :class="campo"><option value="">Todos</option><option v-for="e in ESTADOS" :key="e">{{ e }}</option></select>
        </label>
        <label class="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
          <span :class="etiquetaFiltro">Responsable principal</span>
          <select v-model="formulario.responsable" :class="campo"><option value="">Todos</option><option v-for="f in filasReporte" :key="f.nombre">{{ f.nombre }}</option></select>
        </label>
      </form>
      <div class="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3.5 sm:flex-row sm:items-center md:px-5">
        <p class="text-sm text-slate-500">Período: <strong class="text-slate-900">{{ periodo }}</strong></p>
        <div class="grid grid-cols-2 gap-2 sm:flex">
          <button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100" @click="limpiar">
            <UiIcono nombre="limpiar" clase="h-4 w-4" grosor="2" />
            Limpiar
          </button>
          <button type="submit" form="form-reportes" class="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700">
            <UiIcono nombre="filtro" clase="h-4 w-4" grosor="2" />
            Aplicar filtros
          </button>
        </div>
      </div>
    </section>

    <section class="mt-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      <UiMetricCard class="col-span-2 lg:col-span-1" label="Cumplimiento general" :value="`${resumen.cumplimiento}%`" tone="primary" />
      <UiMetricCard label="Tareas asignadas" :value="resumen.asignadas" tone="slate" />
      <UiMetricCard label="Terminadas a tiempo" :value="resumen.aTiempo" tone="teal" />
      <UiMetricCard class="col-span-2 lg:col-span-1" label="Tareas vencidas" :value="resumen.vencidas" tone="rose" />
    </section>

    <UiPanelCard class="mt-6" title="Cumplimiento por trabajador">
      <template #actions>
        <p class="hidden text-sm text-slate-500 sm:block">Cumplimiento = tareas terminadas sobre asignadas</p>
      </template>
      <div class="overflow-x-auto">
        <table class="w-full min-w-215 text-left">
          <thead class="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
            <tr>
              <th class="px-6 py-3 font-medium">Trabajador</th>
              <th class="px-6 py-3 font-medium">Trabajos a cargo</th>
              <th class="px-6 py-3 font-medium">Tareas asignadas</th>
              <th class="px-6 py-3 font-medium">Terminadas</th>
              <th class="px-6 py-3 font-medium">A tiempo</th>
              <th class="px-6 py-3 font-medium">Vencidas</th>
              <th class="px-6 py-3 font-medium">Cumplimiento</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="f in filas" :key="f.nombre" class="transition hover:bg-slate-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{{ f.iniciales }}</span>
                  <div>
                    <p class="font-semibold text-slate-900">{{ f.nombre }}</p>
                    <p class="text-sm text-slate-500">{{ f.especialidad }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ f.trabajos }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ f.asignadas }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ f.terminadas }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ f.aTiempo }}</td>
              <td class="px-6 py-4">
                <UiEtiqueta v-if="f.vencidas" :texto="String(f.vencidas)" :clases="clasesVencido" />
                <span v-else class="text-sm text-slate-400">0</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="h-2 w-28 rounded-full bg-slate-100">
                    <div class="h-2 rounded-full bg-linear-to-r from-teal-600 to-blue-800" :style="{ width: `${f.porcentaje}%` }" />
                  </div>
                  <span class="w-10 text-sm font-semibold" :class="f.color">{{ f.porcentaje }}%</span>
                </div>
              </td>
            </tr>
            <tr v-if="!filas.length">
              <td colspan="7" class="px-6 py-14 text-center">
                <p class="font-semibold text-slate-900">No hay datos con estos filtros</p>
                <p class="mt-1 text-sm text-slate-500">Prueba con otro período o limpia los filtros.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiPanelCard>

    <div class="mt-6 grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
      <UiPanelCard v-for="grafico in [{ titulo: 'Trabajos por estado', datos: porEstado }, { titulo: 'Trabajos por tipo', datos: porTipo }]" :key="grafico.titulo" :title="grafico.titulo">
        <ul class="flex flex-col gap-5 p-4 md:p-6">
          <li v-for="d in grafico.datos" :key="d.nombre">
            <div class="flex items-baseline justify-between text-sm">
              <span class="flex items-center gap-2 text-slate-700"><span class="h-2 w-2 shrink-0 rounded-full" :class="d.color" />{{ d.nombre }}</span>
              <span class="font-semibold text-slate-900">{{ d.cantidad }}</span>
            </div>
            <div class="mt-2 h-2 rounded-full bg-slate-100">
              <div class="h-2 rounded-full" :class="d.color" :style="{ width: ancho(d.cantidad) }" />
            </div>
          </li>
        </ul>
      </UiPanelCard>
    </div>
  </div>
</template>

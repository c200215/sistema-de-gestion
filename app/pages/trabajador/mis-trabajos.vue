<script setup lang="ts">
import type { Trabajo } from '~/data/trabajos'

definePageMeta({ layout: 'trabajador' })
useHead({ title: 'Mis trabajos · Ignite LATAM Gestión' })

const yo = useSesion().value.nombre
const { trabajos } = useTrabajos()

const formulario = reactive({ texto: '', tipo: '', estado: '', prioridad: '' })
const aplicados = reactive({ ...formulario })

const visibles = computed(() => {
  const texto = normalizar(aplicados.texto)
  return Object.values(trabajos.value).filter((t) =>
    (t.responsable===yo || t.tareas.some((x) => x.asignado === yo))
    && (!aplicados.tipo || t.tipo === aplicados.tipo)
    && (!aplicados.estado || t.estado === aplicados.estado)
    && (!aplicados.prioridad || t.prioridad === aplicados.prioridad)
    && (!texto || normalizar(`${t.codigo} ${t.titulo} ${t.cliente}`).includes(texto)))
})

function limpiar() {
  Object.assign(formulario, { texto: '', tipo: '', estado: '', prioridad: '' })
  Object.assign(aplicados, formulario)
}

function resumen(t: Trabajo) {
  const terminadas = t.tareas.filter((x) => x.estado === 'Terminado').length
  const mias = t.tareas.filter((x) => x.asignado === yo).length
  return { terminadas, mias, porcentaje: t.tareas.length ? Math.round((terminadas * 100) / t.tareas.length) : 0 }
}

const campo = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'
const etiquetaFiltro = 'text-xs font-medium text-slate-500'
</script>

<template>
  <div>
    <UiPageHeading title="Mis trabajos" description="Trabajos donde tienes tareas asignadas. Cada uno lo coordina un jefe como responsable principal." />

    <section class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white md:mt-8">
      <form id="form-mis-trabajos" class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:p-5 xl:grid-cols-5" @submit.prevent="Object.assign(aplicados, formulario)">
        <label class="flex flex-col gap-1.5 sm:col-span-2">
          <span :class="etiquetaFiltro">Buscar</span>
          <span class="relative">
            <UiIcono nombre="buscar" clase="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" grosor="2" />
            <input v-model="formulario.texto" type="search" placeholder="Título, cliente o código" class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20">
          </span>
        </label>
        <label class="flex flex-col gap-1.5">
          <span :class="etiquetaFiltro">Tipo</span>
          <select v-model="formulario.tipo" :class="campo"><option value="">Todos</option><option>Proyecto</option><option>Consulta</option><option>Soporte técnico</option></select>
        </label>
        <label class="flex flex-col gap-1.5">
          <span :class="etiquetaFiltro">Estado</span>
          <select v-model="formulario.estado" :class="campo"><option value="">Todos</option><option v-for="e in ESTADOS" :key="e">{{ e }}</option></select>
        </label>
        <label class="flex flex-col gap-1.5">
          <span :class="etiquetaFiltro">Prioridad</span>
          <select v-model="formulario.prioridad" :class="campo"><option value="">Todas</option><option v-for="p in ['Urgente', 'Alta', 'Media', 'Baja']" :key="p">{{ p }}</option></select>
        </label>
      </form>
      <div class="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3.5 sm:flex-row sm:items-center md:px-5">
        <p class="text-sm text-slate-500"><strong class="text-slate-900">{{ visibles.length }}</strong> trabajos encontrados</p>
        <div class="grid grid-cols-2 gap-2 sm:flex">
          <button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100" @click="limpiar">
            <UiIcono nombre="limpiar" clase="h-4 w-4" grosor="2" />
            Limpiar
          </button>
          <button type="submit" form="form-mis-trabajos" class="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700">
            <UiIcono nombre="filtro" clase="h-4 w-4" grosor="2" />
            Aplicar filtros
          </button>
        </div>
      </div>
    </section>

    <section class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-225 text-left">
          <thead class="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
            <tr>
              <th class="px-6 py-3 font-medium">Trabajo</th>
              <th class="px-6 py-3 font-medium">Responsable principal</th>
              <th class="px-6 py-3 font-medium">Tareas</th>
              <th class="px-6 py-3 font-medium">Prioridad</th>
              <th class="px-6 py-3 font-medium">Estado</th>
              <th class="px-6 py-3 font-medium">Fecha límite</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="t in visibles" :key="t.codigo" class="transition hover:bg-slate-50">
              <td class="px-6 py-5">
                <p class="text-xs text-slate-400">{{ t.codigo }} · {{ t.tipo }}</p>
                <NuxtLink :to="`/trabajador/trabajos/${t.codigo}`" class="mt-1 block font-semibold text-slate-900 hover:text-teal-700">{{ t.titulo }}</NuxtLink>
                <p class="text-sm text-slate-500">{{ t.cliente }}</p>
              </td>
              <td class="px-6 py-5">
                <p class="text-sm">{{ t.responsable }}</p>
                <p class="text-xs text-slate-400">Jefe a cargo</p>
              </td>
              <td class="px-6 py-5">
                <p class="text-sm text-slate-600">{{ resumen(t).terminadas }} de {{ t.tareas.length }} terminadas</p>
                <div class="mt-2 h-1.5 w-28 rounded-full bg-slate-100">
                  <div class="h-1.5 rounded-full bg-linear-to-r from-teal-600 to-blue-800" :style="{ width: `${resumen(t).porcentaje}%` }" />
                </div>
                <p class="mt-1.5 text-xs font-medium text-blue-800">{{ resumen(t).mias }} {{ resumen(t).mias === 1 ? 'asignada' : 'asignadas' }} a ti</p>
              </td>
              <td class="px-6 py-5"><UiEtiqueta :texto="t.prioridad" :clases="clasesPrioridad[t.prioridad]" /></td>
              <td class="px-6 py-5"><UiEtiqueta :texto="t.estado" :clases="clasesEstado[t.estado]" /></td>
              <td class="px-6 py-5 text-sm" :class="t.vencido && t.estado !== 'Terminado' ? 'font-medium text-rose-600' : 'text-slate-600'">
                {{ t.fecha }}
                <p v-if="t.vencido && t.estado !== 'Terminado'" class="text-xs font-normal">Vencido</p>
              </td>
            </tr>
            <tr v-if="!visibles.length">
              <td colspan="6" class="px-6 py-14 text-center">
                <p class="font-semibold text-slate-900">No hay trabajos con estos filtros</p>
                <p class="mt-1 text-sm text-slate-500">Prueba con otros criterios o limpia los filtros.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

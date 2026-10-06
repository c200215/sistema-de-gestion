<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Resumen · Ignite LATAM Gestión' })

const { trabajos } = useTrabajos()
const cargas = useCargas()

const lista = computed(() => Object.values(trabajos.value))
const metricas = computed(() => [
  { label: 'Trabajos totales', value: lista.value.length, tone: 'primary' as const },
  { label: 'En curso', value: lista.value.filter((t) => t.estado === 'En curso').length, tone: 'blue' as const },
  { label: 'Pendientes', value: lista.value.filter((t) => t.estado === 'Pendiente').length, tone: 'amber' as const },
  { label: 'Vencidos', value: lista.value.filter((t) => t.vencido && t.estado !== 'Terminado').length, tone: 'rose' as const },
])

const recientes = computed(() => [...lista.value].sort((a, b) => b.codigo.localeCompare(a.codigo)).slice(0, 3))

const carga = computed(() => {
  const conCarga = cargas.value.filter((c) => c.persona.activo && c.persona.perfil === 'Trabajador' && c.puntaje > 0)
  const maximo = Math.max(1, ...conCarga.map((c) => c.puntaje))
  return conCarga.sort((a, b) => b.puntaje - a.puntaje).slice(0, 4).map((c) => ({ ...c, ancho: Math.round((c.puntaje * 100) / maximo) }))
})

function terminadas(t: { tareas: { estado: string }[] }) {
  return t.tareas.filter((x) => x.estado === 'Terminado').length
}
</script>

<template>
  <div>
    <UiPageHeading title="Resumen" description="Estado general de los trabajos y las tareas del equipo." />

    <section class="mt-6 grid grid-cols-3 gap-3 md:mt-8 md:gap-4 lg:grid-cols-4">
      <UiMetricCard v-for="(m, i) in metricas" :key="m.label" v-bind="m" :class="i === 0 ? 'col-span-3 lg:col-span-1' : ''" />
    </section>

    <div class="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:gap-6 xl:grid-cols-3">
      <UiPanelCard title="Trabajos recientes" class="xl:col-span-2">
        <template #actions>
          <NuxtLink to="/admin/trabajos" class="text-sm font-medium text-teal-700 hover:text-blue-800">Ver todos</NuxtLink>
        </template>
        <ul class="divide-y divide-slate-100">
          <li v-for="t in recientes" :key="t.codigo" class="flex flex-col justify-between gap-3 px-4 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-start sm:gap-4 md:px-6 md:py-5">
            <div>
              <NuxtLink :to="`/admin/trabajos/${t.codigo}`" class="font-semibold text-slate-900 hover:text-teal-700">{{ t.titulo }}</NuxtLink>
              <p class="mt-1 text-sm text-slate-500">Responsable: {{ t.responsable }}</p>
              <p class="mt-1 text-sm text-slate-400">{{ terminadas(t) }} de {{ t.tareas.length }} tareas terminadas</p>
            </div>
            <UiEtiqueta class="self-start" :texto="t.estado" :clases="clasesEstado[t.estado]" />
          </li>
        </ul>
      </UiPanelCard>

      <UiPanelCard title="Carga del equipo">
        <template #actions>
          <NuxtLink to="/admin/reportes" class="text-sm font-medium text-teal-700 hover:text-blue-800">Ver reporte completo</NuxtLink>
        </template>
        <ul class="grid grid-cols-1 gap-6 p-4 md:grid-cols-2 md:p-6 xl:grid-cols-1">
          <li v-for="c in carga" :key="c.persona.id">
            <div class="flex items-baseline justify-between">
              <p class="font-semibold text-slate-900">{{ c.persona.nombre }}</p>
              <p class="text-sm text-slate-400">{{ plural(c.trabajosActivos, 'trabajo', 'trabajos') }}</p>
            </div>
            <p class="text-sm text-slate-500">{{ plural(c.tareasAbiertas, 'tarea abierta', 'tareas abiertas') }}</p>
            <div class="mt-2 h-2 rounded-full bg-slate-100">
              <div class="h-2 rounded-full bg-linear-to-r from-teal-600 to-blue-800" :style="{ width: `${c.ancho}%` }" />
            </div>
          </li>
        </ul>
      </UiPanelCard>
    </div>
  </div>
</template>

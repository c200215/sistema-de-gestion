<script setup lang="ts">
definePageMeta({ layout: 'trabajador' })
useHead({ title: 'Inicio · Ignite LATAM Gestión' })

const yo = useSesion().value.nombre
const { trabajos, tareasDe } = useTrabajos()
const conversaciones=useConversaciones('trabajador')
const ultimoAnuncio=computed(()=>conversaciones.value.find(c=>c.general)?.mensajes.at(-1))

const abiertas = computed(() => tareasDe(yo)
  .filter(({ tarea }) => tarea.estado !== 'Terminado')
  .sort((a, b) => Number(b.tarea.vencida) - Number(a.tarea.vencida)))

const misTrabajos = computed(() => Object.values(trabajos.value)
  .filter((t) => t.estado !== 'Terminado' && (t.responsable===yo || t.tareas.some((x) => x.asignado === yo))))

function terminadas(t: { tareas: { estado: string }[] }) {
  return t.tareas.filter((x) => x.estado === 'Terminado').length
}
</script>

<template>
  <div>
    <UiPageHeading :title="`Hola, ${yo}`" description="Esto es lo que tienes pendiente." />

    <section class="mt-6 grid grid-cols-3 gap-3 md:mt-8 md:gap-4">
      <UiMetricCard label="Tareas abiertas" :value="abiertas.length" tone="primary" />
      <UiMetricCard label="Vencidas" :value="abiertas.filter((x) => x.tarea.vencida).length" tone="rose" />
      <UiMetricCard label="Trabajos activos" :value="misTrabajos.length" tone="blue" />
    </section>

    <div class="mt-6 grid grid-cols-1 items-start gap-4 md:mt-8 md:gap-6 xl:grid-cols-3">
      <UiPanelCard title="Tus próximas tareas" class="xl:col-span-2">
        <template #actions>
          <NuxtLink to="/trabajador/mis-tareas" class="text-sm font-medium text-teal-700 hover:text-blue-800">Ver todas</NuxtLink>
        </template>
        <ul class="divide-y divide-slate-100">
          <li v-for="{ tarea, trabajo } in abiertas" :key="tarea.id">
            <NuxtLink :to="`/trabajador/tareas/${tarea.id}`" class="flex flex-col gap-2 px-4 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-4 md:px-6">
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-slate-900">{{ tarea.titulo }}</p>
                <p class="mt-0.5 truncate text-sm text-slate-500">{{ trabajo.codigo }} · {{ trabajo.titulo }}</p>
              </div>
              <div class="flex shrink-0 items-center gap-3">
                <span class="text-sm" :class="tarea.vencida ? 'font-semibold text-rose-600' : 'text-slate-500'">{{ tarea.vencida ? 'Venció el' : 'Vence el' }} {{ tarea.fecha }}</span>
                <UiEtiqueta :texto="tarea.estado" :clases="clasesEstado[tarea.estado]" />
              </div>
            </NuxtLink>
          </li>
          <li v-if="!abiertas.length" class="px-4 py-10 text-center text-sm text-slate-500 md:px-6">No tienes tareas abiertas. Buen trabajo.</li>
        </ul>
      </UiPanelCard>

      <div class="flex flex-col gap-4 md:gap-6">
        <UiPanelCard title="Último anuncio">
          <template #actions>
            <NuxtLink to="/trabajador/mensajes?c=general" class="text-sm font-medium text-teal-700 hover:text-blue-800">Ver anuncios</NuxtLink>
          </template>
          <div class="flex gap-3 px-4 py-5 md:px-6">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-600 to-blue-800 text-xs font-semibold text-white">EQ</span>
            <div>
              <p class="text-sm"><span class="font-semibold text-slate-900">Anuncios del equipo</span> <span class="text-xs text-slate-400">{{ultimoAnuncio?.hora}}</span></p>
              <p class="mt-1 text-sm leading-relaxed text-slate-700">{{ultimoAnuncio?.texto || 'Todavía no hay anuncios.'}}</p>
            </div>
          </div>
        </UiPanelCard>

        <UiPanelCard title="Tus trabajos">
          <template #actions>
            <NuxtLink to="/trabajador/mis-trabajos" class="text-sm font-medium text-teal-700 hover:text-blue-800">Ver todos</NuxtLink>
          </template>
          <ul class="divide-y divide-slate-100">
            <li v-for="t in misTrabajos" :key="t.codigo">
              <NuxtLink :to="`/trabajador/trabajos/${t.codigo}`" class="block px-4 py-4 transition hover:bg-slate-50 md:px-6">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-xs text-slate-400">{{ t.codigo }} · {{ t.tipo }}</p>
                    <p class="mt-0.5 font-semibold text-slate-900">{{ t.titulo }}</p>
                  </div>
                  <UiEtiqueta :texto="t.prioridad" :clases="clasesPrioridad[t.prioridad]" />
                </div>
                <p class="mt-3 text-sm text-slate-500">{{ terminadas(t) }} de {{ t.tareas.length }} tareas terminadas · Jefe: {{ t.responsable }}</p>
                <div class="mt-2 h-2 rounded-full bg-slate-100">
                  <div class="h-2 rounded-full bg-linear-to-r from-teal-600 to-blue-800" :style="{ width: `${t.tareas.length ? (terminadas(t) * 100) / t.tareas.length : 0}%` }" />
                </div>
              </NuxtLink>
            </li>
            <li v-if="!misTrabajos.length" class="px-4 py-8 text-center text-sm text-slate-500 md:px-6">No tienes trabajos activos.</li>
          </ul>
        </UiPanelCard>
      </div>
    </div>
  </div>
</template>

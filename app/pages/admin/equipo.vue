<script setup lang="ts">
const { ejecutar, pendiente } = useAcciones()
const { subir } = useAdjuntos()
import { especialidades, type Integrante, type Perfil } from '~/data/equipo'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Equipo · Ignite LATAM Gestión' })

const equipo = useEquipo()
const cargas = useCargas()
const { mostrar } = useAviso()

const filtros = reactive({ texto: '', perfil: '', especialidad: '', estado: '' })
const modalPersona = ref(false)
const eliminando = ref<Integrante | null>(null)
const editando = ref<Integrante | null>(null)
const form = reactive({ nombre: '', correo: '', perfil: 'Trabajador' as Perfil, especialidad: 'Soporte', clave: '' })
const cambio = ref<{ persona: Integrante, activar: boolean } | null>(null)

const cargaDe = (id: number) => cargas.value.find((c) => c.persona.id === id) ?? { trabajosActivos: 0, tareasAbiertas: 0, puntaje: 0 }

const visibles = computed(() => {
  const texto = normalizar(filtros.texto)
  return equipo.value.filter((p) =>
    (!texto || normalizar(`${p.nombre} ${p.correo}`).includes(texto))
    && (!filtros.perfil || p.perfil === filtros.perfil)
    && (!filtros.especialidad || p.especialidad === filtros.especialidad)
    && (!filtros.estado || (filtros.estado === 'activo') === p.activo))
})

const totales = computed(() => ({
  activos: equipo.value.filter((p) => p.activo).length,
  inactivos: equipo.value.filter((p) => !p.activo).length,
  disponibles: equipo.value.filter((p) => p.activo && p.perfil === 'Trabajador' && cargaDe(p.id).puntaje === 0).length,
}))

function nivel(puntaje: number) {
  if (puntaje === 0) return { texto: 'Disponible', ancho: 0, clase: 'text-teal-700' }
  if (puntaje >= 7) return { texto: 'Carga alta', ancho: 100, clase: 'text-rose-600' }
  if (puntaje >= 4) return { texto: 'Carga media', ancho: 60, clase: 'text-amber-700' }
  return { texto: 'Carga baja', ancho: 30, clase: 'text-slate-500' }
}

function generarClave() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  form.clave = Array.from({ length: 10 }, () => caracteres[crypto.getRandomValues(new Uint32Array(1))[0]! % caracteres.length]).join('')
}

function abrirPersona(persona?: Integrante) {
  editando.value = persona ?? null
  Object.assign(form, persona
    ? { nombre: persona.nombre, correo: persona.correo, perfil: persona.perfil, especialidad: persona.especialidad, clave: '' }
    : { nombre: '', correo: '', perfil: 'Trabajador', especialidad: 'Soporte', clave: '' })
  if (!persona) generarClave()
  modalPersona.value = true
}

async function guardar() {
    const datos={...form,id:editando.value?.id,clave:form.clave||undefined}
    if(await ejecutar('persona',datos)) { modalPersona.value=false; mostrar('Persona guardada') }
  }

async function confirmarEliminacion() {
  if (!eliminando.value || pendiente.value) return
  if (await ejecutar('eliminar-persona', { id: eliminando.value.id })) {
    eliminando.value = null
    mostrar('Trabajador eliminado del equipo. Su historial se conserva.')
  }
}

async function confirmarCambio() {
    if(!cambio.value) return
    if(await ejecutar('persona',{...cambio.value.persona,activo:cambio.value.activar})) { cambio.value=null; mostrar('Acceso actualizado') }
  }

const campo = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'
const etiquetaFiltro = 'text-xs font-medium text-slate-500'

const permisosAdmin = ['Registra, edita y desactiva integrantes; elimina trabajadores del equipo', 'Crea trabajos, asigna responsables y organiza sus tareas', 'Define el estado general de cada trabajo', 'Conecta Gmail y convierte correos en trabajos', 'Genera reportes y publica anuncios para todo el equipo']
const permisosTrabajador = ['Ve los trabajos que dirige o donde tiene tareas asignadas', 'Actualiza el estado de sus propias tareas', 'Registra comentarios, avances y documentos', 'Si es responsable principal, edita las tareas de su trabajo', 'Envía mensajes internos al equipo']
</script>

<template>
  <div>
    <UiPageHeading title="Equipo" description="Personas con acceso a la plataforma, su perfil, especialidad y carga de trabajo.">
      <template #actions>
        <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700" @click="abrirPersona()">
          <UiIcono nombre="mas" clase="h-4 w-4" grosor="2.5" />
          Registrar integrante
        </button>
      </template>
    </UiPageHeading>

    <section class="mt-6 grid grid-cols-3 gap-3 md:mt-8 md:gap-4">
      <UiMetricCard label="Activos" :value="totales.activos" tone="primary" />
      <UiMetricCard label="Inactivos" :value="totales.inactivos" tone="slate" />
      <UiMetricCard label="Disponibles" :value="totales.disponibles" tone="teal" />
    </section>

    <section class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:p-5 xl:grid-cols-5">
        <label class="flex flex-col gap-1.5 sm:col-span-2">
          <span :class="etiquetaFiltro">Buscar</span>
          <span class="relative">
            <UiIcono nombre="buscar" clase="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" grosor="2" />
            <input v-model="filtros.texto" type="search" placeholder="Nombre o correo" class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20">
          </span>
        </label>
        <label class="flex flex-col gap-1.5">
          <span :class="etiquetaFiltro">Perfil</span>
          <select v-model="filtros.perfil" :class="campo"><option value="">Todos</option><option>Administrador</option><option>Trabajador</option></select>
        </label>
        <label class="flex flex-col gap-1.5">
          <span :class="etiquetaFiltro">Especialidad</span>
          <select v-model="filtros.especialidad" :class="campo"><option value="">Todas</option><option v-for="e in especialidades" :key="e">{{ e }}</option></select>
        </label>
        <label class="flex flex-col gap-1.5">
          <span :class="etiquetaFiltro">Estado</span>
          <select v-model="filtros.estado" :class="campo"><option value="">Todos</option><option value="activo">Activos</option><option value="inactivo">Inactivos</option></select>
        </label>
      </div>
      <div class="flex flex-col justify-between gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3.5 text-sm sm:flex-row sm:items-center md:px-5">
        <p class="text-slate-500"><strong class="text-slate-900">{{ visibles.length }}</strong> integrantes · La carga considera trabajos y tareas sin terminar</p>
        <button type="button" class="self-start font-medium text-teal-700 transition hover:text-blue-800 sm:self-auto" @click="Object.assign(filtros, { texto: '', perfil: '', especialidad: '', estado: '' })">Limpiar filtros</button>
      </div>
    </section>

    <section class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-225 text-left">
          <thead class="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
            <tr>
              <th class="px-6 py-3 font-medium">Integrante</th>
              <th class="px-6 py-3 font-medium">Perfil y especialidad</th>
              <th class="px-6 py-3 font-medium">Estado</th>
              <th class="px-6 py-3 font-medium">Carga activa</th>
              <th class="px-6 py-3 font-medium">Último acceso</th>
              <th class="px-6 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="p in visibles" :key="p.id" class="transition hover:bg-slate-50" :class="p.activo ? '' : 'opacity-70'">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold" :class="p.perfil === 'Administrador' ? 'bg-linear-to-br from-teal-600 to-blue-800 text-white' : 'bg-slate-100 text-slate-600'">{{ iniciales(p.nombre) }}</span>
                  <div class="min-w-0">
                    <p class="font-semibold text-slate-900">{{ p.nombre }} <span v-if="p.yo" class="font-normal text-slate-400">(tú)</span></p>
                    <p class="truncate text-sm text-slate-500">{{ p.correo }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-slate-700">{{ p.perfil }}</p>
                <p class="text-sm text-slate-500">{{ p.especialidad }}</p>
              </td>
              <td class="px-6 py-4"><UiEtiqueta :texto="p.activo ? 'Activo' : 'Inactivo'" :clases="p.activo ? clasesPositivo : clasesNeutro" /></td>
              <td class="px-6 py-4">
                <template v-if="p.activo">
                  <p class="text-sm text-slate-700">{{ plural(cargaDe(p.id).trabajosActivos, 'trabajo', 'trabajos') }} · {{ plural(cargaDe(p.id).tareasAbiertas, 'tarea', 'tareas') }}</p>
                  <div class="mt-2 flex items-center gap-2">
                    <div class="h-1.5 w-20 rounded-full bg-slate-100">
                      <div class="h-1.5 rounded-full bg-linear-to-r from-teal-600 to-blue-800" :style="{ width: `${nivel(cargaDe(p.id).puntaje).ancho}%` }" />
                    </div>
                    <span class="text-xs font-medium" :class="nivel(cargaDe(p.id).puntaje).clase">{{ nivel(cargaDe(p.id).puntaje).texto }}</span>
                  </div>
                </template>
                <p v-else class="text-sm text-slate-400">Sin acceso</p>
              </td>
              <td class="px-6 py-4 text-sm" :class="p.acceso === 'En línea' ? 'font-medium text-teal-700' : 'text-slate-500'">{{ p.acceso }}</td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap items-center justify-end gap-1">
                  <button type="button" class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100" @click="abrirPersona(p)">
                    <UiIcono nombre="lapiz" clase="h-4 w-4" grosor="2" />
                    Editar
                  </button>
                  <span v-if="p.yo" class="px-3 py-2 text-xs text-slate-400">Tu cuenta</span>
                  <button v-else-if="p.activo" type="button" class="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50" @click="cambio = { persona: p, activar: false }">Desactivar</button>
                  <button v-else type="button" class="rounded-lg px-3 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50" @click="cambio = { persona: p, activar: true }">Reactivar</button>
                  <button v-if="!p.yo && p.perfil === 'Trabajador'" type="button" class="rounded-lg px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50" @click="eliminando = p">Eliminar</button>
                </div>
              </td>
            </tr>
            <tr v-if="!visibles.length">
              <td colspan="6" class="px-6 py-14 text-center">
                <p class="font-semibold text-slate-900">No hay integrantes con estos filtros</p>
                <p class="mt-1 text-sm text-slate-500">Prueba con otros criterios o limpia los filtros.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <details class="group mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 transition hover:bg-slate-50 md:px-6">
        <span>
          <span class="block text-base font-bold text-slate-900 md:text-lg">¿Qué puede hacer cada perfil?</span>
          <span class="block text-sm text-slate-500">Los permisos son fijos según el perfil asignado.</span>
        </span>
        <UiIcono nombre="abajo" clase="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" grosor="2" />
      </summary>
      <div class="grid grid-cols-1 gap-4 px-4 pb-6 md:grid-cols-2 md:px-6">
        <div v-for="bloque in [{ titulo: 'Administrador', lista: permisosAdmin }, { titulo: 'Trabajador', lista: permisosTrabajador }]" :key="bloque.titulo" class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p class="font-semibold text-slate-900">{{ bloque.titulo }}</p>
          <ul class="mt-3 flex flex-col gap-2 text-sm text-slate-600">
            <li v-for="permiso in bloque.lista" :key="permiso" class="flex gap-2">
              <UiIcono nombre="check" clase="mt-0.5 h-4 w-4 shrink-0 text-teal-600" grosor="2.5" />
              <span>{{ permiso }}</span>
            </li>
          </ul>
        </div>
      </div>
    </details>

    <UiModal :open="modalPersona" :title="editando ? 'Editar integrante' : 'Registrar integrante'" :description="editando ? 'Los cambios de perfil se aplican la próxima vez que la persona inicie sesión.' : 'La persona podrá iniciar sesión con su correo y la contraseña temporal.'" max-width="max-w-xl" @close="modalPersona = false">
      <form id="form-persona" class="flex flex-col gap-5" @submit.prevent="guardar">
        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-slate-700">Nombre completo <span class="text-rose-500">*</span></span>
          <input v-model="form.nombre" type="text" required placeholder="Ej: Ana Torres" :class="campo">
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-slate-700">Correo corporativo <span class="text-rose-500">*</span></span>
          <input v-model="form.correo" type="email" required placeholder="nombre@ignitelatam.com" :class="campo">
        </label>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-slate-700">Perfil <span class="text-rose-500">*</span></span>
            <select v-model="form.perfil" required :disabled="!!editando?.yo" :class="campo"><option>Trabajador</option><option>Administrador</option></select>
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-slate-700">Especialidad <span class="text-rose-500">*</span></span>
            <select v-model="form.especialidad" required :class="campo"><option v-for="e in especialidades" :key="e">{{ e }}</option></select>
          </label>
        </div>
        <div v-if="!editando" class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-slate-700">Contraseña temporal <span class="text-rose-500">*</span></span>
          <div class="flex gap-2">
            <input v-model="form.clave" type="text" required minlength="8" class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20">
            <button type="button" class="shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100" @click="generarClave">Generar</button>
          </div>
          <span class="text-xs text-slate-500">Mínimo 8 caracteres. Compártela con la persona por un canal seguro.</span>
        </div>
      </form>
      <template #footer>
        <button type="button" class="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100" @click="modalPersona = false">Cancelar</button>
        <button type="submit" form="form-persona" class="rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700">{{ editando ? 'Guardar cambios' : 'Registrar' }}</button>
      </template>
    </UiModal>

    <UiModal :open="!!eliminando" :title="eliminando ? `¿Eliminar a ${eliminando.nombre}?` : ''" max-width="max-w-md" @close="!pendiente && (eliminando = null)">
      <p class="text-sm leading-relaxed text-slate-600">Se quitará del equipo, perderá el acceso y no podrá reactivarse. Su historial, comentarios, mensajes y archivos se conservarán.</p>
      <p v-if="eliminando && cargaDe(eliminando.id).puntaje" class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Tiene trabajos o tareas pendientes. Sus asignaciones se conservan para que puedas revisarlas y reorganizar el trabajo.</p>
      <template #footer>
        <button type="button" :disabled="pendiente" class="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50" @click="eliminando = null">Cancelar</button>
        <button type="button" :disabled="pendiente" class="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50" @click="confirmarEliminacion">{{ pendiente ? 'Eliminando…' : 'Eliminar trabajador' }}</button>
      </template>
    </UiModal>

    <UiModal :open="!!cambio" :title="cambio ? `¿${cambio.activar ? 'Reactivar' : 'Desactivar'} a ${cambio.persona.nombre}?` : ''" max-width="max-w-md" @close="cambio = null">
      <template v-if="cambio">
        <p class="text-sm leading-relaxed text-slate-600">
          {{ cambio.activar ? 'Podrá volver a iniciar sesión y se le podrán asignar trabajos y tareas.' : 'No podrá iniciar sesión ni recibir nuevas asignaciones. Su historial, comentarios y documentos se conservan.' }}
        </p>
        <div v-if="!cambio.activar && cargaDe(cambio.persona.id).puntaje" class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          Tiene <strong>{{ plural(cargaDe(cambio.persona.id).trabajosActivos, 'trabajo', 'trabajos') }}</strong> como responsable y <strong>{{ plural(cargaDe(cambio.persona.id).tareasAbiertas, 'tarea', 'tareas') }}</strong> sin terminar. Quedarán sin encargado hasta que los reasignes desde
          <NuxtLink to="/admin/trabajos" class="font-semibold underline underline-offset-2">Trabajos</NuxtLink>.
        </div>
      </template>
      <template #footer>
        <button type="button" class="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100" @click="cambio = null">Cancelar</button>
        <button type="button" class="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition" :class="cambio?.activar ? 'bg-linear-to-r from-teal-600 to-blue-800 shadow-lg shadow-blue-800/20 hover:from-teal-500 hover:to-blue-700' : 'bg-rose-600 hover:bg-rose-700'" @click="confirmarCambio">{{ cambio?.activar ? 'Reactivar' : 'Desactivar' }}</button>
      </template>
    </UiModal>
  </div>
</template>

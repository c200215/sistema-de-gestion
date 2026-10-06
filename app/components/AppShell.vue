<script setup lang="ts">
const { ejecutar } = useAcciones()
const { subir } = useAdjuntos()
import type { Rol } from '~/composables/useDatos'

const props = defineProps<{ rol: Rol }>()

const route = useRoute()
const nuxt=useNuxtApp()
let refresco: ReturnType<typeof setInterval> | undefined
onMounted(()=>{refresco=setInterval(()=>{
  if(!document.hidden && !useState('guardando').value) void nuxt.runWithContext(()=>cargarDatos()).catch(()=>{})
},15000)})
onBeforeUnmount(()=>clearInterval(refresco))
const usuario = computed(() => ({...useSesion().value, iniciales: iniciales(useSesion().value.nombre), detalle: useSesion().value.perfil}))
async function salir() {
  await $fetch('/api/auth/logout',{method:'POST'})
  clearNuxtState()
  await navigateTo('/')
}
const base = computed(() => props.rol === 'admin' ? '/admin' : '/trabajador')

const menuMovil = ref(false)
const contraido = ref(false)
const panelAbierto = ref<'mensajes' | 'notificaciones' | null>(null)

const { tareasDe } = useTrabajos()
const correos = useCorreos()
const conversaciones = useConversaciones(props.rol)
const notificaciones = useNotificaciones(props.rol)

const correosPendientes = computed(() => correos.value.filter((c) => !c.trabajo && !c.descartado).length)
const tareasAbiertas = computed(() => tareasDe(useSesion().value.nombre).filter(({ tarea }) => tarea.estado !== 'Terminado').length)

interface ItemMenu {
  etiqueta: string
  ruta: string
  icono: string
  activoEn: string[]
  contador?: number
}

const menu = computed<ItemMenu[]>(() => props.rol === 'admin'
  ? [
      { etiqueta: 'Inicio', ruta: '/admin', icono: 'inicio', activoEn: [] },
      { etiqueta: 'Trabajos', ruta: '/admin/trabajos', icono: 'trabajos', activoEn: ['/admin/trabajos', '/admin/tareas'] },
      { etiqueta: 'Correos', ruta: '/admin/correos', icono: 'correos', activoEn: ['/admin/correos'], contador: correosPendientes.value },
      { etiqueta: 'Equipo', ruta: '/admin/equipo', icono: 'equipo', activoEn: ['/admin/equipo'] },
      { etiqueta: 'Reportes', ruta: '/admin/reportes', icono: 'reportes', activoEn: ['/admin/reportes'] },
    ]
  : [
      { etiqueta: 'Inicio', ruta: '/trabajador', icono: 'inicio', activoEn: [] },
      { etiqueta: 'Mis trabajos', ruta: '/trabajador/mis-trabajos', icono: 'trabajos', activoEn: ['/trabajador/mis-trabajos', '/trabajador/trabajos'] },
      { etiqueta: 'Mis tareas', ruta: '/trabajador/mis-tareas', icono: 'tareas', activoEn: ['/trabajador/mis-tareas', '/trabajador/tareas'], contador: tareasAbiertas.value },
    ])

function estaActivo(item: ItemMenu) {
  if (!item.activoEn.length) return route.path === item.ruta
  return item.activoEn.some((ruta) => route.path === ruta || route.path.startsWith(`${ruta}/`))
}

const conversacionesRecientes = computed(() => conversaciones.value.filter((c) => c.mensajes.length).slice(0, 4))
const mensajesSinLeer = computed(() => conversaciones.value.filter((c) => c.noLeidos).length)
const notificacionesSinLeer = computed(() => notificaciones.value.filter((n) => !n.leida).length)

function ultimo(c: { mensajes: { mio: boolean, texto: string, hora: string }[] }) {
  return c.mensajes[c.mensajes.length - 1]
}

const tonos: Record<string, string> = {
  teal: 'bg-teal-50 text-teal-700',
  azul: 'bg-blue-50 text-blue-800',
  gris: 'bg-slate-100 text-slate-600',
  ambar: 'bg-amber-50 text-amber-700',
  rosa: 'bg-rose-50 text-rose-600',
}

function alternarPanel(panel: 'mensajes' | 'notificaciones') {
  panelAbierto.value = panelAbierto.value === panel ? null : panel
}

async function marcarTodasLeidas() { await ejecutar('leer-notificaciones') }

function cerrarPaneles() {
  panelAbierto.value = null
}

function alPresionarTecla(e: KeyboardEvent) {
  if (e.key === 'Escape') cerrarPaneles()
}

onMounted(() => {
  window.addEventListener('click', cerrarPaneles)
  window.addEventListener('keydown', alPresionarTecla)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', cerrarPaneles)
  window.removeEventListener('keydown', alPresionarTecla)
})

watch(() => route.fullPath, () => {
  menuMovil.value = false
  panelAbierto.value = null
})

watch(menuMovil, (abierto) => {
  if (import.meta.client) document.body.classList.toggle('overflow-hidden', abierto)
})

const panelClases = 'fixed left-4 right-4 top-18 z-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96'
const insignia = 'absolute right-1 top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ring-2 ring-white'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50 text-slate-800">
    <header class="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div class="flex min-w-0 items-center gap-3">
        <button type="button" aria-label="Abrir menú" class="-ml-2 rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden" @click="menuMovil = true">
          <UiIcono nombre="menu" clase="h-6 w-6" grosor="2" />
        </button>
        <p class="truncate text-base font-bold text-blue-600 sm:text-lg">Ignite LATAM <span class="hidden font-normal text-slate-400 sm:inline">Gestión</span></p>
      </div>

      <nav class="flex shrink-0 items-center gap-1 sm:gap-2" @click.stop>
        <div class="relative">
          <button type="button" aria-label="Mensajes" title="Mensajes" :aria-expanded="panelAbierto === 'mensajes'" class="relative rounded-xl p-2 text-slate-600 transition hover:bg-slate-100" @click="alternarPanel('mensajes')">
            <UiIcono nombre="chat" clase="h-6 w-6" />
            <span v-if="mensajesSinLeer" :class="insignia" class="bg-teal-600">{{ mensajesSinLeer }}</span>
          </button>

          <div v-if="panelAbierto === 'mensajes'" :class="panelClases">
            <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
              <p class="font-bold text-slate-900">Mensajes</p>
              <NuxtLink :to="`${base}/mensajes?nuevo=1`" class="text-sm font-medium text-teal-700 transition hover:text-blue-800">Nuevo mensaje</NuxtLink>
            </div>
            <ul class="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
              <li v-for="c in conversacionesRecientes" :key="c.id">
                <NuxtLink :to="`${base}/mensajes?c=${c.id}`" class="flex gap-3 px-4 py-3.5 transition hover:bg-slate-50" :class="c.noLeidos ? 'bg-teal-50/40' : ''">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold" :class="c.general || c.admin ? 'bg-linear-to-br from-teal-600 to-blue-800 text-white' : 'bg-slate-100 text-slate-600'">{{ c.iniciales }}</span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-baseline justify-between gap-2">
                      <p class="truncate text-sm" :class="c.noLeidos ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'">{{ c.nombre }}</p>
                      <p class="shrink-0 text-xs text-slate-400">{{ ultimo(c)?.hora }}</p>
                    </div>
                    <p class="mt-0.5 truncate text-sm" :class="c.noLeidos ? 'text-slate-700' : 'text-slate-500'">{{ ultimo(c)?.mio ? 'Tú: ' : '' }}{{ ultimo(c)?.texto }}</p>
                  </div>
                  <span class="w-2 shrink-0" :class="c.noLeidos ? 'mt-1.5 h-2 rounded-full bg-teal-600' : ''" />
                </NuxtLink>
              </li>
            </ul>
            <NuxtLink :to="`${base}/mensajes`" class="block border-t border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-600 transition hover:text-teal-700">Ver todos los mensajes</NuxtLink>
          </div>
        </div>

        <div class="relative">
          <button type="button" aria-label="Notificaciones" title="Notificaciones" :aria-expanded="panelAbierto === 'notificaciones'" class="relative rounded-xl p-2 text-slate-600 transition hover:bg-slate-100" @click="alternarPanel('notificaciones')">
            <UiIcono nombre="campana" clase="h-6 w-6" />
            <span v-if="notificacionesSinLeer" :class="insignia" class="bg-rose-500">{{ notificacionesSinLeer }}</span>
          </button>

          <div v-if="panelAbierto === 'notificaciones'" :class="panelClases">
            <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
              <p class="font-bold text-slate-900">Notificaciones</p>
              <button type="button" class="text-sm font-medium text-teal-700 transition hover:text-blue-800" @click="marcarTodasLeidas">Marcar todas como leídas</button>
            </div>
            <ul class="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
              <li v-for="n in notificaciones" :key="n.id">
                <NuxtLink :to="n.enlace" class="flex gap-3 px-4 py-3.5 transition hover:bg-slate-50" :class="n.leida ? '' : 'bg-teal-50/40'" @click="n.leida = true">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" :class="tonos[n.tono]">
                    <UiIcono :nombre="n.icono" clase="h-4 w-4" grosor="2" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm leading-snug text-slate-700">
                      <template v-for="(parte, i) in n.titulo" :key="i">
                        <strong v-if="parte.destacado" class="font-semibold text-slate-900">{{ parte.texto }}</strong>
                        <template v-else>{{ parte.texto }}</template>
                      </template>
                    </p>
                    <p class="mt-0.5 truncate text-xs text-slate-500">{{ n.detalle }}</p>
                    <p class="mt-1 text-xs text-slate-400">{{ n.fecha }}</p>
                  </div>
                  <span class="w-2 shrink-0" :class="n.leida ? '' : 'mt-1.5 h-2 rounded-full bg-teal-600'" />
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <NuxtLink to="#" class="hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 md:inline-block">Mi perfil</NuxtLink>
        <button type="button" @click="salir" class="ml-1 rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700 sm:px-4">Cerrar sesión</button>
      </nav>
    </header>

    <div v-if="menuMovil" class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" @click="menuMovil = false" />

    <div class="flex flex-1">
      <aside
        class="fixed left-0 top-0 z-50 flex h-screen shrink-0 flex-col overflow-hidden bg-slate-900 text-slate-300 transition-all duration-300 lg:sticky lg:top-16 lg:z-auto lg:h-[calc(100vh-4rem)] lg:translate-x-0"
        :class="[menuMovil ? 'translate-x-0' : '-translate-x-full', contraido ? 'w-64 lg:w-20' : 'w-64']"
      >
        <div class="flex items-center gap-3 border-b border-slate-800 px-6 py-6" :class="contraido ? 'lg:justify-center lg:px-0' : ''">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">{{ usuario.iniciales }}</span>
          <div class="min-w-0" :class="contraido ? 'lg:hidden' : ''">
            <p class="truncate font-semibold text-white">{{ usuario.nombre }}</p>
            <p class="text-sm text-slate-400">{{ usuario.detalle }}</p>
          </div>
          <button type="button" aria-label="Cerrar menú" class="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden" @click="menuMovil = false">
            <UiIcono nombre="cerrar" grosor="2" />
          </button>
        </div>

        <nav class="flex flex-col gap-1 p-3" aria-label="Navegación principal">
          <NuxtLink
            v-for="item in menu"
            :key="item.ruta"
            :to="item.ruta"
            :title="item.etiqueta"
            class="relative flex items-center gap-3 rounded-xl px-4 py-3"
            :class="[
              estaActivo(item) ? 'bg-linear-to-r from-teal-600 to-blue-800 font-medium text-white shadow-lg shadow-blue-900/40' : 'transition hover:bg-slate-800 hover:text-white',
              contraido ? 'lg:justify-center lg:px-0' : '',
            ]"
          >
            <UiIcono :nombre="item.icono" clase="h-5 w-5 shrink-0" />
            <span :class="contraido ? 'lg:hidden' : ''">{{ item.etiqueta }}</span>
            <span
              v-if="item.contador"
              class="ml-auto rounded-full bg-teal-600 px-2 py-0.5 text-xs font-semibold text-white"
              :class="contraido ? 'lg:absolute lg:right-3 lg:top-1.5 lg:px-1.5' : ''"
            >{{ item.contador }}</span>
          </NuxtLink>
        </nav>

        <div class="mt-auto hidden border-t border-slate-800 p-3 lg:block">
          <button type="button" title="Contraer o desplegar menú" class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white" :class="contraido ? 'justify-center px-0' : ''" @click="contraido = !contraido">
            <UiIcono nombre="colapsar" clase="h-5 w-5 shrink-0 transition-transform duration-300" :class="contraido ? 'rotate-180' : ''" />
            <span v-if="!contraido">Contraer menú</span>
          </button>
        </div>
      </aside>

      <main class="min-w-0 flex-1 px-4 py-6 sm:px-6 md:py-8 lg:px-10">
        <slot />
      </main>
    </div>

    <UiAviso />
  </div>
</template>

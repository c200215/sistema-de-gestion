<script setup lang="ts">
const { ejecutar } = useAcciones()
const { subir } = useAdjuntos()
import type { Rol } from '~/composables/useDatos'

const props = defineProps<{ rol: Rol }>()

const route = useRoute()
const router = useRouter()
const conversaciones = useConversaciones(props.rol)
const esAdmin = props.rol === 'admin'

const busqueda = ref('')
const actualId = ref<string>(String(route.query.c ?? '') || (conversaciones.value.find((c) => c.mensajes.length)?.id ?? ''))
const vista = ref<'lista' | 'chat'>(route.query.c ? 'chat' : 'lista')
const texto = ref('')
const chat = ref<HTMLElement | null>(null)

const modalNuevo = ref(false)
const nuevo = reactive({ destino: '', texto: '' })

const actual = computed(() => conversaciones.value.find((c) => c.id === actualId.value) ?? null)
const puedeEscribir = computed(() => !!actual.value && (!actual.value.general || esAdmin))

const visibles = computed(() => {
  const filtro = normalizar(busqueda.value)
  return conversaciones.value.filter((c) => c.mensajes.length && normalizar(c.nombre).includes(filtro))
})

const destinos = computed(() => conversaciones.value
  .filter((c) => esAdmin || !c.general)
  .map((c) => ({ id: c.id, etiqueta: c.general ? 'Todo el equipo (anuncio general)' : c.admin ? `${c.nombre} (administrador)` : c.nombre })))

function avatar(c: { general?: boolean, admin?: boolean }) {
  return c.general || c.admin ? 'bg-linear-to-br from-teal-600 to-blue-800 text-white' : 'bg-slate-100 text-slate-600'
}

function ultimo(c: { mensajes: { mio: boolean, texto: string, hora: string }[] }) {
  return c.mensajes[c.mensajes.length - 1]
}

async function bajarAlFinal() {
  await nextTick()
  if (chat.value) chat.value.scrollTop = chat.value.scrollHeight
}

function abrir(id: string) {
  actualId.value = id
  vista.value = 'chat'
  const c = conversaciones.value.find((x) => x.id === id)
  if(c?.noLeidos) void ejecutar('leer-chat',{id})
  bajarAlFinal()
}

async function enviarA(id: string, contenido: string) {
    if(await ejecutar('mensaje',{destino:id,texto:contenido})) { texto.value=''; actualId.value=id; vista.value='chat'; bajarAlFinal() }
  }

function enviar() {
  const contenido = texto.value.trim()
  if (!contenido || !actual.value) return
  enviarA(actual.value.id, contenido)
}

function alPresionar(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    enviar()
  }
}

function abrirNuevo() {
  nuevo.destino = destinos.value[0]?.id ?? ''
  nuevo.texto = ''
  modalNuevo.value = true
}

function enviarNuevo() {
  const contenido = nuevo.texto.trim()
  if (!contenido || !nuevo.destino) return
  modalNuevo.value = false
  enviarA(nuevo.destino, contenido)
}

watch(() => route.query, (q) => {
  if (q.c && conversaciones.value.some((c) => c.id === q.c)) abrir(String(q.c))
  if (q.nuevo) {
    abrirNuevo()
    router.replace({ query: {} })
  }
}, { immediate: true })

onMounted(() => {
  if(actual.value?.noLeidos) void ejecutar('leer-chat',{id:actual.value.id})
  bajarAlFinal()
})
</script>

<template>
  <div class="flex flex-col">
    <UiPageHeading title="Mensajes" :description="esAdmin ? 'Conversaciones internas del equipo y anuncios generales.' : 'Conversaciones con tu equipo y anuncios del administrador.'">
      <template #actions>
        <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700" @click="abrirNuevo">
          <UiIcono nombre="mas" clase="h-4 w-4" grosor="2.5" />
          Nuevo mensaje
        </button>
      </template>
    </UiPageHeading>

    <section class="mt-6 grid h-[calc(100vh-12rem)] min-h-120 overflow-hidden rounded-2xl border border-slate-200 bg-white md:mt-8 md:h-[calc(100vh-14rem)] lg:grid-cols-[20rem_1fr]">
      <div class="min-h-0 flex-col border-slate-200 lg:flex lg:border-r" :class="vista === 'chat' ? 'hidden' : 'flex'">
        <div class="border-b border-slate-100 p-3">
          <label class="relative block">
            <span class="sr-only">Buscar conversación</span>
            <UiIcono nombre="buscar" clase="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" grosor="2" />
            <input v-model="busqueda" type="search" placeholder="Buscar persona" class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20">
          </label>
        </div>
        <ul class="flex-1 divide-y divide-slate-100 overflow-y-auto">
          <li v-for="c in visibles" :key="c.id">
            <button type="button" class="flex w-full gap-3 px-4 py-3.5 text-left transition" :class="c.id === actualId ? 'bg-teal-50' : 'hover:bg-slate-50'" @click="abrir(c.id)">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold" :class="avatar(c)">{{ c.iniciales }}</span>
              <span class="min-w-0 flex-1">
                <span class="flex items-baseline justify-between gap-2">
                  <span class="truncate text-sm" :class="c.noLeidos ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'">{{ c.nombre }}</span>
                  <span class="shrink-0 text-xs text-slate-400">{{ ultimo(c)?.hora }}</span>
                </span>
                <span class="mt-0.5 flex items-center gap-2">
                  <span class="flex-1 truncate text-sm" :class="c.noLeidos ? 'text-slate-700' : 'text-slate-500'">{{ ultimo(c)?.mio ? 'Tú: ' : '' }}{{ ultimo(c)?.texto }}</span>
                  <span v-if="c.noLeidos" class="h-2 w-2 shrink-0 rounded-full bg-teal-600" />
                </span>
              </span>
            </button>
          </li>
          <li v-if="!visibles.length" class="px-4 py-10 text-center text-sm text-slate-500">No hay conversaciones con ese nombre.</li>
        </ul>
      </div>

      <div class="min-h-0 flex-col lg:flex" :class="vista === 'chat' ? 'flex' : 'hidden'">
        <template v-if="actual">
          <div class="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 md:px-6">
            <button type="button" aria-label="Volver a las conversaciones" class="-ml-2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden" @click="vista = 'lista'">
              <UiIcono nombre="atras" grosor="2" />
            </button>
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold" :class="avatar(actual)">{{ actual.iniciales }}</span>
            <div class="min-w-0">
              <p class="truncate font-semibold text-slate-900">{{ actual.nombre }}</p>
              <p class="truncate text-sm text-slate-500">{{ actual.detalle }}</p>
            </div>
          </div>

          <div ref="chat" class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-slate-50 px-4 py-5 md:px-6">
            <p v-if="actual.general" class="self-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">
              {{ esAdmin ? 'Solo el administrador puede publicar en este canal' : 'Canal de anuncios del administrador' }}
            </p>
            <p v-if="!actual.mensajes.length" class="m-auto text-sm text-slate-400">Aún no hay mensajes. Escribe el primero.</p>
            <div v-for="(m, i) in actual.mensajes" :key="i" class="flex max-w-[85%] flex-col sm:max-w-[70%]" :class="m.mio ? 'items-end self-end' : 'items-start self-start'">
              <p class="whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed" :class="m.mio ? 'rounded-br-md bg-linear-to-br from-teal-600 to-blue-800 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'">{{ m.texto }}</p>
              <span class="mt-1 px-1 text-xs text-slate-400">{{ m.hora }}</span>
            </div>
          </div>

          <form v-if="puedeEscribir" class="flex items-end gap-2 border-t border-slate-100 p-3 md:p-4" @submit.prevent="enviar">
            <label class="flex-1">
              <span class="sr-only">Escribe un mensaje</span>
              <textarea v-model="texto" rows="1" placeholder="Escribe un mensaje" class="block max-h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20" @keydown="alPresionar" />
            </label>
            <button type="submit" aria-label="Enviar" class="shrink-0 rounded-xl bg-linear-to-r from-teal-600 to-blue-800 p-3 text-white shadow-md shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700">
              <UiIcono nombre="enviar" grosor="2" />
            </button>
          </form>
          <p v-else class="border-t border-slate-100 px-4 py-4 text-center text-sm text-slate-500 md:px-6">Solo el administrador puede publicar anuncios. Si tienes dudas, escríbele directamente.</p>
        </template>
        <div v-else class="m-auto p-8 text-center text-sm text-slate-500">Selecciona una conversación.</div>
      </div>
    </section>

    <UiModal :open="modalNuevo" title="Nuevo mensaje" :description="esAdmin ? 'Escribe a una persona del equipo o publica un anuncio para todos.' : 'Escribe a una persona del equipo.'" max-width="max-w-lg" @close="modalNuevo = false">
      <form id="form-nuevo-mensaje" class="flex flex-col gap-4" @submit.prevent="enviarNuevo">
        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-slate-700">Para</span>
          <select v-model="nuevo.destino" required class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20">
            <option v-for="d in destinos" :key="d.id" :value="d.id">{{ d.etiqueta }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-slate-700">Mensaje</span>
          <textarea v-model="nuevo.texto" required rows="4" placeholder="Escribe tu mensaje" class="resize-y rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />
        </label>
      </form>
      <template #footer>
        <button type="button" class="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100" @click="modalNuevo = false">Cancelar</button>
        <button type="submit" form="form-nuevo-mensaje" class="rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700">Enviar</button>
      </template>
    </UiModal>
  </div>
</template>

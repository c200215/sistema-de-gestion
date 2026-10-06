<script setup lang="ts">
const { ejecutar } = useAcciones()
const { subir } = useAdjuntos()
import type { Correo } from '~/data/correos'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Correos · Ignite LATAM Gestión' })

type Filtro = 'sin' | 'con' | 'descartados'

const correos = useCorreos()
const { trabajos } = useTrabajos()
const { mostrar } = useAviso()
const nuxt=useNuxtApp()
const route=useRoute()
const {data:gmail,refresh:refrescarGmail}=await useFetch('/api/gmail/estado')
const procesandoGmail=ref(false)
let reloj:ReturnType<typeof setInterval>|undefined
let siguientePagina:ReturnType<typeof setTimeout>|undefined

const filtro = ref<Filtro>('sin')
const busqueda = ref('')
const actualId = ref<number | null>(correos.value.find((c) => !c.trabajo && !c.descartado)?.id ?? null)
const vista = ref<'lista' | 'detalle'>('lista')
const trabajoParaVincular = ref('')
const modalCrear = ref(false)
const sincronizacion=computed(()=>gmail.value?.error || (gmail.value?.pendiente?'Importando correos…':gmail.value?.ultimaSync?'Última actualización: '+new Date(gmail.value.ultimaSync).toLocaleString('es-CL'):gmail.value?.conectado?'Listo para sincronizar':'Conecta el buzón para importar los correos.'))
async function conectarGmail(){
  procesandoGmail.value=true
  try{const result=await $fetch('/api/gmail/conectar',{method:'POST'});await navigateTo(result.url,{external:true})}
  catch(e:any){mostrar(e.data?.statusMessage||'No se pudo iniciar la conexión con Google.')}
  finally{procesandoGmail.value=false}
}
async function desconectarGmail(){
  procesandoGmail.value=true;clearTimeout(siguientePagina)
  try{const result=await $fetch('/api/gmail/desconectar',{method:'POST'});await refrescarGmail();mostrar(result.revocado?'Gmail desconectado. Los correos importados se conservaron.':'Desconectado localmente. Revisa también el permiso en tu cuenta de Google.')}
  catch(e:any){mostrar(e.data?.statusMessage||'No se pudo desconectar.')}
  finally{procesandoGmail.value=false}
}

const pestanas: { id: Filtro, etiqueta: string }[] = [
  { id: 'sin', etiqueta: 'Sin vincular' },
  { id: 'con', etiqueta: 'Vinculados' },
  { id: 'descartados', etiqueta: 'Descartados' },
]

const cuentas = computed(() => ({
  sin: correos.value.filter((c) => !c.trabajo && !c.descartado).length,
  con: correos.value.filter((c) => c.trabajo).length,
  descartados: correos.value.filter((c) => c.descartado).length,
}))

const visibles = computed(() => {
  const texto = normalizar(busqueda.value)
  return correos.value.filter((c) => {
    const pasa = (filtro.value === 'sin' && !c.trabajo && !c.descartado)
      || (filtro.value === 'con' && !!c.trabajo)
      || (filtro.value === 'descartados' && c.descartado)
    return pasa && (!texto || normalizar(`${c.asunto} ${c.remitente} ${c.correo}`).includes(texto))
  })
})

const actual = computed(() => correos.value.find((c) => c.id === actualId.value) ?? null)
const opcionesTrabajo = computed(() => Object.values(trabajos.value).map((t) => ({ codigo: t.codigo, titulo: t.titulo })))

function abrir(c: Correo) {
  actualId.value = c.id
  void ejecutar('correo',{id:c.id,leido:true})
  trabajoParaVincular.value = ''
  vista.value = 'detalle'
}

async function vincular() {
  if (!actual.value) return
  if (!trabajoParaVincular.value) {
    mostrar('Selecciona el trabajo al que quieres vincular el correo')
    return
  }
  if(await ejecutar('correo',{id:actual.value.id,trabajo:trabajoParaVincular.value})) mostrar(`Correo vinculado a ${trabajoParaVincular.value}`)
}

async function cambiarDescarte(c: Correo, descartar: boolean) {
  if(!await ejecutar('correo',{id:c.id,descartado:descartar}))return
  if (descartar) mostrar('Correo descartado', () => cambiarDescarte(c, false))
  else mostrar('Correo restaurado a Sin vincular')
}

function alCrear(codigo: string) {
  mostrar(`Trabajo ${codigo} creado y vinculado al correo`)
}

async function sincronizar(manual=true) {
  if(procesandoGmail.value||!gmail.value?.conectado)return
  procesandoGmail.value=true;clearTimeout(siguientePagina)
  try{
    const result=await $fetch('/api/gmail/sincronizar',{method:'POST'})
    await nuxt.runWithContext(()=>cargarDatos());await refrescarGmail()
    if(actualId.value===null)actualId.value=correos.value[0]?.id??null
    if(result.pendiente)siguientePagina=setTimeout(()=>sincronizar(false),1500)
    else if(manual||result.importados)mostrar(result.importados?`${result.importados} correos importados`:'Bandeja actualizada')
  }catch(e:any){await refrescarGmail();if(manual)mostrar(e.data?.statusMessage||'No se pudo sincronizar Gmail.')}
  finally{procesandoGmail.value=false}
}

onMounted(() => {
  if(actual.value) void ejecutar('correo',{id:actual.value.id,leido:true})
  if(route.query.gmail==='ok'){mostrar('Cuenta de Gmail conectada');void sincronizar()}
  else if(route.query.gmail==='denegado')mostrar('No se autorizó el acceso a Gmail. Puedes volver a conectar.')
  else if(route.query.gmail==='error')mostrar('No se completó la conexión. Revisa la cuenta configurada y vuelve a conectar.')
  reloj=setInterval(()=>{if(!document.hidden)void sincronizar(false)},60000)
})
onBeforeUnmount(()=>{clearInterval(reloj);clearTimeout(siguientePagina)})
</script>

<template>
  <div class="flex flex-col">
    <UiPageHeading title="Correos" description="Requerimientos recibidos en Gmail. Crea un trabajo a partir de un correo o vincúlalo a uno existente." />

    <section class="mt-6 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center md:mt-8 md:px-5">
      <div class="flex min-w-0 items-center gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-600 to-blue-800 text-white">
          <UiIcono nombre="correos" />
        </span>
        <div class="min-w-0">
          <p class="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span class="h-2 w-2 shrink-0 rounded-full bg-teal-600" />
            <span class="truncate">{{gmail?.conectado?'Conectado: '+gmail.correo:gmail?.requiereConexion?'Vuelve a autorizar Gmail':'Gmail pendiente de conexión'}}</span>
          </p>
          <p class="text-sm text-slate-500">{{ sincronizacion }}</p>
        </div>
      </div>
      <div class="grid shrink-0 grid-cols-2 gap-2 sm:flex">
        <button :disabled="procesandoGmail" type="button" class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50" @click="conectarGmail">{{gmail?.conectado?'Reconectar':'Conectar Gmail'}}</button>
        <button v-if="gmail?.conectado||gmail?.requiereConexion" :disabled="procesandoGmail" type="button" class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-rose-700 disabled:opacity-50" @click="desconectarGmail">Desconectar</button>
        <button :disabled="procesandoGmail||!gmail?.conectado" type="button" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50" @click="sincronizar()">
          <UiIcono nombre="sync" clase="h-4 w-4" grosor="2" />
          Actualizar
        </button>
      </div>
    </section>

    <section class="mt-4 grid h-[calc(100vh-12rem)] min-h-130 overflow-hidden rounded-2xl border border-slate-200 bg-white md:mt-6 md:h-[calc(100vh-14rem)] lg:grid-cols-[24rem_1fr]">
      <div class="min-h-0 flex-col border-slate-200 lg:flex lg:border-r" :class="vista === 'detalle' ? 'hidden' : 'flex'">
        <div class="grid grid-cols-3 border-b border-slate-100 px-2">
          <button
            v-for="p in pestanas"
            :key="p.id"
            type="button"
            class="flex items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-1 py-3 text-sm transition"
            :class="filtro === p.id ? 'border-teal-600 font-semibold text-teal-700' : 'border-transparent font-medium text-slate-500'"
            @click="filtro = p.id"
          >
            {{ p.etiqueta }}
            <span class="rounded-full px-2 py-0.5 text-xs" :class="filtro === p.id ? 'bg-linear-to-r from-teal-600 to-blue-800 text-white' : 'bg-slate-100'">{{ cuentas[p.id] }}</span>
          </button>
        </div>
        <div class="border-b border-slate-100 p-3">
          <label class="relative block">
            <span class="sr-only">Buscar correo</span>
            <UiIcono nombre="buscar" clase="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" grosor="2" />
            <input v-model="busqueda" type="search" placeholder="Buscar por asunto o remitente" class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20">
          </label>
        </div>
        <ul class="flex-1 divide-y divide-slate-100 overflow-y-auto">
          <li v-for="c in visibles" :key="c.id">
            <button type="button" class="flex w-full gap-3 px-4 py-3.5 text-left transition" :class="c.id === actualId ? 'bg-teal-50' : 'hover:bg-slate-50'" @click="abrir(c)">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{{ iniciales(c.remitente) }}</span>
              <span class="min-w-0 flex-1">
                <span class="flex items-baseline justify-between gap-2">
                  <span class="truncate text-sm" :class="c.leido ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'">{{ c.remitente }}</span>
                  <span class="shrink-0 text-xs text-slate-400">{{ c.hora }}</span>
                </span>
                <span class="mt-0.5 block truncate text-sm" :class="c.leido ? 'text-slate-600' : 'font-medium text-slate-900'">{{ c.asunto }}</span>
                <span class="mt-1.5 flex items-center gap-2">
                  <UiEtiqueta v-if="c.descartado" texto="Descartado" :clases="clasesNeutro" class="py-0.5! px-2!" />
                  <UiEtiqueta v-else-if="c.trabajo" :texto="c.trabajo" :clases="clasesPositivo" class="py-0.5! px-2!" />
                  <UiEtiqueta v-else texto="Sin vincular" :clases="clasesAdvertencia" class="py-0.5! px-2!" />
                  <span v-if="c.adjuntos.length" class="flex items-center gap-1 text-xs text-slate-400"><UiIcono nombre="clip" clase="h-4 w-4" grosor="2" />{{ c.adjuntos.length }}</span>
                  <span v-if="!c.leido" class="ml-auto h-2 w-2 shrink-0 rounded-full bg-teal-600" />
                </span>
              </span>
            </button>
          </li>
          <li v-if="!visibles.length" class="px-4 py-12 text-center">
            <p class="font-semibold text-slate-900">No hay correos aquí</p>
            <p class="mt-1 text-sm text-slate-500">{{ filtro === 'sin' ? 'Todos los requerimientos están procesados.' : 'Prueba con otra pestaña o búsqueda.' }}</p>
          </li>
        </ul>
      </div>

      <div class="min-h-0 min-w-0 flex-col lg:flex" :class="vista === 'detalle' ? 'flex' : 'hidden'">
        <div v-if="!actual" class="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <p class="font-semibold text-slate-900">Selecciona un correo</p>
          <p class="text-sm text-slate-500">Aquí verás su contenido y podrás convertirlo en un trabajo.</p>
        </div>

        <template v-else>
          <div class="flex items-center gap-2 border-b border-slate-100 px-4 py-3 md:px-6 lg:hidden">
            <button type="button" class="-ml-2 inline-flex items-center gap-1 rounded-lg p-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100" @click="vista = 'lista'">
              <UiIcono nombre="atras" grosor="2" />
              Correos
            </button>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
            <h2 class="text-lg font-bold text-slate-900 md:text-xl">{{ actual.asunto }}</h2>
            <div class="mt-4 flex items-start gap-3">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{{ iniciales(actual.remitente) }}</span>
              <div class="min-w-0 flex-1">
                <div class="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                  <p class="font-semibold text-slate-900">{{ actual.remitente }}</p>
                  <p class="text-xs text-slate-400">{{ actual.fecha }}</p>
                </div>
                <p class="truncate text-sm text-slate-500">{{ actual.correo }}</p>
              </div>
            </div>
            <p class="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">{{ actual.cuerpo }}</p>
            <div v-if="actual.adjuntos.length" class="mt-6">
              <p class="text-xs font-medium text-slate-500">Adjuntos ({{ actual.adjuntos.length }})</p>
              <ul class="mt-2 flex flex-wrap gap-2">
                <li v-for="a in actual.adjuntos" :key="a.nombre" class="flex max-w-full flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <UiIcono nombre="clip" clase="h-4 w-4 text-teal-700" grosor="2" />
                  <span class="min-w-0 font-medium text-slate-700 [overflow-wrap:anywhere]">{{ a.nombre }}</span>
                  <span class="text-slate-400">{{ a.peso }}</span>
                  <a v-if="a.id && a.permitido!==false" :href="'/api/gmail/adjuntos/'+a.id" class="text-teal-700 underline" download>Descargar</a>
                  <span v-else-if="a.permitido===false" class="text-xs text-amber-700">Formato o tamaño no admitido</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="border-t border-slate-100 p-4 md:p-6">
            <div v-if="actual.descartado" class="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
              <div>
                <p class="text-sm font-semibold text-slate-900">Descartaste este correo</p>
                <p class="mt-0.5 text-sm text-slate-500">No aparece en la bandeja de pendientes. Sigue disponible en Gmail.</p>
              </div>
              <button type="button" class="inline-flex shrink-0 justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100" @click="cambiarDescarte(actual, false)">Restaurar</button>
            </div>

            <div v-else-if="actual.trabajo" class="flex flex-col justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 sm:flex-row sm:items-center">
              <div class="min-w-0">
                <p class="text-xs font-medium text-teal-700">Vinculado al trabajo</p>
                <p class="mt-0.5 truncate font-semibold text-slate-900">{{ actual.trabajo }} · {{ trabajos[actual.trabajo]?.titulo }}</p>
              </div>
              <NuxtLink :to="`/admin/trabajos/${actual.trabajo}`" class="inline-flex shrink-0 justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Ver trabajo</NuxtLink>
            </div>

            <div v-else class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-semibold text-slate-900">Este correo aún no está asociado a un trabajo</p>
              <p class="mt-1 text-sm text-slate-500">Crea un trabajo nuevo con estos datos o agrégalo a uno existente.</p>
              <div class="mt-4 flex min-w-0 flex-col gap-3">
                <button type="button" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700" @click="modalCrear = true">
                  <UiIcono nombre="mas" clase="h-4 w-4" grosor="2.5" />
                  Crear trabajo
                </button>
                <div class="flex min-w-0 flex-1 flex-wrap gap-2">
                  <select v-model="trabajoParaVincular" aria-label="Trabajo existente" class="w-full min-w-0 flex-[1_1_14rem] rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20">
                    <option value="">Vincular a un trabajo existente</option>
                    <option v-for="t in opcionesTrabajo" :key="t.codigo" :value="t.codigo">{{ t.codigo }} · {{ t.titulo }}</option>
                  </select>
                  <button type="button" class="shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100" @click="vincular">Vincular</button>
                </div>
              </div>
              <div class="mt-4 flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center">
                <p class="text-sm text-slate-500">¿No es un requerimiento? Sácalo de la bandeja sin borrarlo de Gmail.</p>
                <button type="button" class="inline-flex shrink-0 items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 sm:self-auto" @click="cambiarDescarte(actual, true)">
                  <UiIcono nombre="bloquear" clase="h-4 w-4" grosor="2" />
                  Descartar correo
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </section>

    <ModalCrearTrabajo :open="modalCrear" :correo="actual" @close="modalCrear = false" @creado="alCrear" />
  </div>
</template>

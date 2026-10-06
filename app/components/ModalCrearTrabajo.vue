<script setup lang="ts">
const { ejecutar } = useAcciones()
const { subir } = useAdjuntos()
import type { Correo } from '~/data/correos'
import type { Documento, Prioridad, TipoTrabajo } from '~/data/trabajos'

const props = defineProps<{
  open: boolean
  correo?: Correo | null
}>()

const emit = defineEmits<{ close: [], creado: [codigo: string] }>()

const { trabajos, siguienteCodigo } = useTrabajos()
const equipo = useEquipo()
const { mostrar } = useAviso()

const tipos: TipoTrabajo[] = ['Consulta', 'Proyecto', 'Soporte técnico']
const prioridades: { valor: Prioridad, activo: string }[] = [
  { valor: 'Baja', activo: 'border-slate-500 bg-slate-100 text-slate-900' },
  { valor: 'Media', activo: 'border-teal-600 bg-teal-50 text-teal-800' },
  { valor: 'Alta', activo: 'border-orange-400 bg-orange-50 text-orange-700' },
  { valor: 'Urgente', activo: 'border-rose-600 bg-rose-600 text-white' },
]
const canales = ['Manual', 'Correo', 'Teléfono', 'Reunión']
const responsables = computed(() => equipo.value.filter((p) => p.activo && p.perfil === 'Trabajador').map((p) => p.nombre))

const form = reactive({
  titulo: '',
  descripcion: '',
  tipo: 'Consulta' as TipoTrabajo,
  especialidad: 'Soporte',
  prioridad: 'Media' as Prioridad,
  responsable: 'Sin asignar',
  fecha: '',
  cliente: '',
  contacto: '',
  canal: 'Manual',
})
const adjuntosCorreo = ref<{ id?:string, nombre: string, peso: string, permitido?:boolean, incluir: boolean }[]>([])
const archivosNuevos = ref<Documento[]>([])

watch(() => props.open, (abierto) => {
  if (!abierto) return
  const c = props.correo
  Object.assign(form, {
    titulo: c ? c.asunto.replace(/^re:\s*/i, '') : '',
    descripcion: (c?.cuerpo ?? '').slice(0,5000),
    tipo: c?.tipo ?? 'Consulta',
    especialidad: 'Soporte',
    prioridad: 'Media',
    responsable: 'Sin asignar',
    fecha: '',
    cliente: c?.cliente ?? '',
    contacto: c?.correo ?? '',
    canal: c ? 'Correo' : 'Manual',
  })
  adjuntosCorreo.value = (c?.adjuntos ?? []).map((a) => ({ ...a, incluir: a.permitido!==false }))
  archivosNuevos.value = []
})

async function agregarArchivos(archivos: File[]) { archivosNuevos.value.push(...await subir(archivos)) }

async function crear() {
    const result=await ejecutar('crear-trabajo',{...form,correoId:props.correo?.id,adjuntosCorreoIds:adjuntosCorreo.value.filter(a=>a.incluir&&a.id).map(a=>a.id),cliente:form.cliente.trim()||'Sin especificar',contacto:form.contacto.trim()||'Sin especificar',fecha:form.fecha||'Sin fecha'})
    if(!result) return
    if(archivosNuevos.value.length) await ejecutar('adjuntar',{ids:archivosNuevos.value.map((d:any)=>d.id)},result.codigo)
    emit('creado',result.codigo); emit('close')
  }

const campo = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'
const etiquetaCampo = 'text-sm font-medium text-slate-700'
</script>

<template>
  <UiModal :open="open" title="Crear trabajo" description="Define el trabajo y su responsable principal. Las tareas se organizan después en el detalle." max-width="max-w-3xl" @close="emit('close')">
    <template v-if="correo" #subtitle>
      <p class="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-800">Desde el correo de {{ correo.remitente }}: "{{ correo.asunto }}"</p>
    </template>

    <form id="form-crear-trabajo" class="flex flex-col gap-8" @submit.prevent="crear">
      <fieldset class="flex flex-col gap-4">
        <legend class="mb-3 text-sm font-semibold text-slate-900">Información general</legend>
        <label class="flex flex-col gap-1.5">
          <span :class="etiquetaCampo">Título del trabajo <span class="text-rose-500">*</span></span>
          <input v-model="form.titulo" type="text" required placeholder="Ej: Migración base de datos cliente Acme" :class="campo">
        </label>
        <label class="flex flex-col gap-1.5">
          <span :class="etiquetaCampo">Descripción <span class="text-rose-500">*</span></span>
          <textarea v-model="form.descripcion" required rows="4" placeholder="Qué se necesita, contexto y resultado esperado" :class="campo" class="resize-y" />
        </label>
      </fieldset>

      <fieldset class="flex flex-col gap-4">
        <legend class="mb-3 text-sm font-semibold text-slate-900">Clasificación</legend>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-1.5">
            <span :class="etiquetaCampo">Tipo de trabajo <span class="text-rose-500">*</span></span>
            <select v-model="form.tipo" required :class="campo"><option v-for="t in tipos" :key="t">{{ t }}</option></select>
          </label>
          <label class="flex flex-col gap-1.5">
            <span :class="etiquetaCampo">Especialidad requerida</span>
            <select v-model="form.especialidad" :class="campo"><option v-for="e in ['Soporte', 'Redes', 'Desarrollo', 'Infraestructura']" :key="e">{{ e }}</option></select>
          </label>
        </div>
        <div class="flex flex-col gap-1.5">
          <span :class="etiquetaCampo">Prioridad</span>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              v-for="p in prioridades"
              :key="p.valor"
              type="button"
              class="rounded-xl border px-3 py-2.5 text-center text-sm transition"
              :class="form.prioridad === p.valor ? p.activo : 'border-slate-300 text-slate-600 hover:bg-slate-50'"
              :aria-pressed="form.prioridad === p.valor"
              @click="form.prioridad = p.valor"
            >{{ p.valor }}</button>
          </div>
        </div>
      </fieldset>

      <fieldset class="flex flex-col gap-4">
        <legend class="mb-3 text-sm font-semibold text-slate-900">Asignación y plazo</legend>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-1.5">
            <span :class="etiquetaCampo">Responsable principal</span>
            <select v-model="form.responsable" :class="campo">
              <option>Sin asignar</option>
              <option v-for="r in responsables" :key="r">{{ r }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1.5">
            <span :class="etiquetaCampo">Fecha límite <span class="font-normal text-slate-400">(opcional)</span></span>
            <input v-model="form.fecha" type="date" :class="campo">
          </label>
        </div>
      </fieldset>

      <fieldset class="flex flex-col gap-4">
        <legend class="mb-3 text-sm font-semibold text-slate-900">Origen del requerimiento</legend>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-1.5">
            <span :class="etiquetaCampo">Cliente o área solicitante</span>
            <input v-model="form.cliente" type="text" placeholder="Ej: Empresa Acme" :class="campo">
          </label>
          <label class="flex flex-col gap-1.5">
            <span :class="etiquetaCampo">Correo de contacto externo</span>
            <input v-model="form.contacto" type="email" placeholder="contacto@cliente.com" :class="campo">
          </label>
          <label class="flex flex-col gap-1.5">
            <span :class="etiquetaCampo">Canal de origen</span>
            <select v-model="form.canal" :class="campo"><option v-for="c in canales" :key="c">{{ c }}</option></select>
          </label>
        </div>
      </fieldset>

      <fieldset class="flex flex-col gap-4">
        <legend class="mb-3 text-sm font-semibold text-slate-900">Documentos adjuntos</legend>
        <div v-if="adjuntosCorreo.length" class="flex flex-col gap-2">
          <p class="text-sm text-slate-500">Adjuntos del correo que se agregarán al trabajo:</p>
          <label v-for="a in adjuntosCorreo" :key="a.nombre" class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm hover:bg-slate-50">
            <input v-model="a.incluir" :disabled="a.permitido===false" type="checkbox" class="h-4 w-4 accent-teal-600">
            <span class="flex-1 font-medium text-slate-700">{{ a.nombre }}</span>
            <span class="text-slate-400">{{ a.peso }}</span>
          </label>
        </div>
        <ZonaCarga @archivos="agregarArchivos" />
        <ul v-if="archivosNuevos.length" class="flex flex-col gap-2">
          <li v-for="(a, i) in archivosNuevos" :key="a.nombre + i" class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <span class="truncate font-medium text-slate-700">{{ a.nombre }}</span>
            <button type="button" class="shrink-0 text-sm font-medium text-rose-600 hover:text-rose-700" @click="archivosNuevos.splice(i, 1)">Quitar</button>
          </li>
        </ul>
      </fieldset>
    </form>

    <template #footer>
      <button type="button" class="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100" @click="emit('close')">Cancelar</button>
      <button type="submit" form="form-crear-trabajo" class="rounded-xl bg-linear-to-r from-teal-600 to-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700">Crear trabajo</button>
    </template>
  </UiModal>
</template>

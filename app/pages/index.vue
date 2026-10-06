<script setup lang="ts">
import loginBackground from '../assets/images/hombre_empresario.jpg'

const email = ref('')
const password = ref('')
const error = ref('')
const pendiente = ref(false)

async function enterWorkspace() {
  pendiente.value=true; error.value=''
  try {
    const user=await $fetch<any>('/api/auth/login',{method:'POST',body:{email:email.value,password:password.value}})
    await navigateTo(user.rol==='admin'?'/admin':'/trabajador')
  } catch(e:any) { error.value=e.data?.statusMessage || 'No se pudo iniciar sesión. Comprueba MySQL en XAMPP.' }
  finally { pendiente.value=false }
}
</script>

<template>
  <main class="grid min-h-screen bg-white lg:grid-cols-2">
    <section class="relative hidden min-h-screen overflow-hidden bg-cover bg-center p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16" :style="{ backgroundImage: `linear-gradient(135deg, rgb(2 6 23 / 85%), rgb(15 23 42 / 75%), rgb(30 58 138 / 80%)), url(${loginBackground})` }">
      <div class="absolute -right-32 top-12 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
      <div class="absolute -bottom-40 -left-24 h-120 w-120 rounded-full bg-blue-500/20 blur-3xl" />
      <div class="relative">
        <p class="text-2xl font-bold tracking-tight text-teal-300">IGNITE LATAM</p>
        <div class="mt-28 max-w-xl">
          <span class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-teal-100">Plataforma de gestión</span>
          <h1 class="mt-7 text-5xl font-bold uppercase leading-tight xl:text-6xl">Gestión de trabajo, sin ruido.</h1>
          <p class="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">Un espacio central para organizar trabajos, responsables, equipos y niveles de acceso.</p>
        </div>
      </div>
      <div class="relative border-t border-white/15 pt-6">
        <p class="text-sm font-medium uppercase tracking-wider">Acceso interno protegido</p>
        <p class="mt-3 text-sm text-slate-300">Uso exclusivo para personal autorizado de IGNITE LATAM.</p>
      </div>
    </section>

    <section class="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12 sm:px-10">
      <div class="w-full max-w-md">
        <NuxtLink to="/" class="text-sm font-bold text-blue-700 lg:hidden">IGNITE LATAM</NuxtLink>
        <p class="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 lg:mt-0">Acceso corporativo</p>
        <h2 class="mt-3 text-3xl font-bold tracking-tight text-slate-900">Iniciar sesión</h2>
        <p class="mt-3 text-sm leading-relaxed text-slate-500">Ingresa tus credenciales para acceder a tu espacio de trabajo.</p>

        <form class="mt-8 flex flex-col gap-5" @submit.prevent="enterWorkspace">
          <label class="flex flex-col gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Correo corporativo</span>
            <input v-model="email" type="email" autocomplete="username" required placeholder="nombre@ignitelatam.com" class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10">
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Contraseña</span>
            <input v-model="password" type="password" autocomplete="current-password" required placeholder="••••••••" class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10">
          </label>

          <p v-if="error" role="alert" class="text-sm text-rose-600">{{ error }}</p>
          <button :disabled="pendiente" type="submit" class="mt-1 w-full rounded-xl bg-linear-to-r from-teal-600 to-blue-800 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-blue-800/20 transition hover:from-teal-500 hover:to-blue-700 hover:shadow-blue-800/30">Continuar</button>
          <p class="text-center text-xs leading-relaxed text-slate-400">Accede con la cuenta creada por tu administrador.</p>
        </form>
      </div>
    </section>
  </main>
</template>

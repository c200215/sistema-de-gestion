export default defineNuxtRouteMiddleware(async to=>{
  if(to.path==='/') return
  try { await cargarDatos() }
  catch(error:any) {
    if(error.statusCode===401) return navigateTo('/')
    throw createError({statusCode:503,statusMessage:'No se pudo conectar con MySQL. Comprueba XAMPP y la configuración .env.'})
  }
  const user=useSesion().value
  if(to.path.startsWith('/admin') && user.rol!=='admin') return navigateTo('/trabajador')
})

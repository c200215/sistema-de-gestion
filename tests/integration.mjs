import assert from 'node:assert/strict'
const base=process.env.TEST_URL||'http://127.0.0.1:3100'
if(!new URL(process.env.DATABASE_URL).pathname.endsWith('_test')) throw Error('Las pruebas requieren una base cuyo nombre termine en _test')
const stamp=Date.now()
let checks=0
async function request(path,{cookie,body,method,expected=200}={}){
  const r=await fetch(base+path,{method:method||(body?'POST':'GET'),headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined})
  const data=await r.json()
  assert.equal(r.status,expected,JSON.stringify(data)); checks++
  return {data,cookie:r.headers.get('set-cookie')?.split(';')[0]}
}
const login=async(email,password)=>(await request('/api/auth/login',{body:{email,password}})).cookie
await request('/api/datos',{expected:401})
await request('/api/auth/login',{body:{email:process.env.ADMIN_EMAIL,password:'invalid-password'},expected:401})
const admin=await login(process.env.ADMIN_EMAIL,process.env.ADMIN_PASSWORD)
const action=async(cookie,accion,datos={},codigo,tareaId,expected=200,version)=>{
  if(codigo&&version===undefined){const state=(await request('/api/datos',{cookie})).data;version=state.trabajos[codigo]?.version}
  return (await request('/api/acciones',{cookie,body:{accion,datos,codigo,tareaId,version},expected})).data
}
const password='Prueba-segura-'+stamp
const name='Trabajador '+stamp,email='trabajador'+stamp+'@example.test'
await action(admin,'persona',{nombre:name,correo:email,perfil:'Trabajador',especialidad:'Soporte',clave:password})
const worker=await login(email,password)
const otherName='Otro '+stamp,otherEmail='otro'+stamp+'@example.test'
await action(admin,'persona',{nombre:otherName,correo:otherEmail,perfil:'Trabajador',especialidad:'Redes',clave:password})
const other=await login(otherEmail,password)
await action(admin,'crear-trabajo',{titulo:'Tipo retirado',descripcion:'No debe aceptarse',tipo:'Presupuesto',cliente:'Prueba',contacto:'prueba@example.test',canal:'Manual',responsable:'Sin asignar',prioridad:'Media',fecha:'Sin fecha'},undefined,undefined,400)

await action(worker,'persona',{nombre:'No permitido',correo:'blocked@example.test',perfil:'Administrador',especialidad:'Soporte',clave:password},undefined,undefined,403)
const payload={titulo:'Trabajo de prueba '+stamp,descripcion:'Verificar persistencia y permisos',tipo:'Proyecto',cliente:'Pruebas',contacto:'pruebas@example.test',canal:'Manual',responsable:name,prioridad:'Alta',fecha:'2026-12-31'}
const {codigo}=await action(admin,'crear-trabajo',payload)
await action(admin,'crear-tarea',{titulo:'Tarea de prueba',descripcion:'Validar transición',asignado:name,fecha:'2026-12-30'},codigo)
const state=(await request('/api/datos',{cookie:worker})).data
assert.equal(state.trabajos[codigo].titulo,payload.titulo);checks++
const task=state.trabajos[codigo].tareas[0]
assert.equal((await request('/api/datos',{cookie:other})).data.trabajos[codigo],undefined);checks++
await action(other,'comentario',{texto:'Sin permiso'},codigo,undefined,404,1)
await action(worker,'estado-trabajo',{estado:'Terminado'},codigo,undefined,403)
await action(worker,'estado-tarea',{estado:'En curso'},codigo,task.id)
await action(worker,'estado-tarea',{estado:'invalido'},codigo,task.id,400)
await action(worker,'avance',{texto:'Avance persistente'},codigo,task.id)
await action(admin,'comentario',{texto:'Observación persistente'},codigo)
await action(admin,'estado-trabajo',{estado:'En curso'},codigo,undefined,409,1)
const form=new FormData();form.append('archivo',new Blob(['%PDF-1.4\nPrueba de archivo'],{type:'application/pdf'}),'prueba.pdf')
const upload=await fetch(base+'/api/documentos',{method:'POST',headers:{cookie:worker},body:form})
assert.equal(upload.status,200);checks++
const file=await upload.json()
await action(worker,'adjuntar',{ids:[file.id]},codigo,task.id)
const download=await fetch(base+'/api/documentos/'+file.id,{headers:{cookie:admin}})
assert.equal(download.status,200);assert.match(await download.text(),/Prueba de archivo/);checks+=2
await request('/api/documentos/'+file.id,{cookie:other,expected:404})
await action(worker,'estado-tarea',{estado:'Terminado'},codigo,task.id)
const adminState=(await request('/api/datos',{cookie:admin})).data
const workerId=adminState.equipo.find(p=>p.correo===email).id
await action(admin,'mensaje',{destino:String(workerId),texto:'Mensaje de prueba'})
const workerState=(await request('/api/datos',{cookie:worker})).data
assert.ok(workerState.conversaciones.some(c=>c.mensajes.some(m=>m.texto==='Mensaje de prueba'&&!m.mio)));checks++
assert.equal(workerState.trabajos[codigo].tareas[0].estado,'Terminado');checks++
assert.ok(workerState.trabajos[codigo].tareas[0].terminada);checks++
await action(worker,'mensaje',{destino:'general',texto:'No permitido'},undefined,undefined,403)
await action(admin,'persona',{id:workerId,nombre:name+' actualizado',correo:email,perfil:'Trabajador',especialidad:'Soporte'})
const renamed=(await request('/api/datos',{cookie:worker})).data
assert.equal(renamed.trabajos[codigo].tareas[0].asignado,name+' actualizado');checks++
await request('/api/auth/logout',{cookie:worker,body:{}})
await request('/api/datos',{cookie:worker,expected:401})
await action(admin,'persona',{id:workerId,nombre:name+' actualizado',correo:email,perfil:'Trabajador',especialidad:'Soporte',activo:false})
await request('/api/auth/login',{body:{email,password},expected:401})
const deletionState=(await request('/api/datos',{cookie:admin})).data
const otherId=deletionState.equipo.find(p=>p.correo===otherEmail).id
await action(other,'eliminar-persona',{id:workerId},undefined,undefined,403)
await action(admin,'eliminar-persona',{id:deletionState.usuario.id},undefined,undefined,403)
await action(admin,'eliminar-persona',{id:workerId})
await action(admin,'eliminar-persona',{id:otherId})
await request('/api/datos',{cookie:other,expected:401})
await request('/api/auth/login',{body:{email:otherEmail,password},expected:401})
await action(admin,'persona',{id:workerId,nombre:name+' actualizado',correo:email,perfil:'Trabajador',especialidad:'Soporte',activo:true},undefined,undefined,404)
await action(admin,'eliminar-persona',{id:workerId},undefined,undefined,404)
const deletedState=(await request('/api/datos',{cookie:admin})).data
assert.ok(!deletedState.equipo.some(p=>p.id===workerId||p.id===otherId));checks++
assert.equal(deletedState.trabajos[codigo].tareas[0].asignado,name+' actualizado');checks++
assert.ok(deletedState.trabajos[codigo].tareas[0].avances.some(a=>a.texto==='Avance persistente'));checks++
assert.ok(deletedState.trabajos[codigo].tareas[0].documentos.some(d=>d.id===file.id));checks++
console.log(checks+' comprobaciones de integración correctas. Ejecutar únicamente en una base de prueba; conserva sus datos para inspección.')

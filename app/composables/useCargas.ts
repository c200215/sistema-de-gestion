export function useCargas() {
  const { trabajos } = useTrabajos()
  const equipo = useEquipo()

  return computed(() => {
    const lista = Object.values(trabajos.value)
    return equipo.value.map((persona) => {
      const trabajosActivos = lista.filter((t) => t.responsable === persona.nombre && t.estado !== 'Terminado').length
      const tareasAbiertas = lista.flatMap((t) => t.tareas).filter((t) => t.asignado === persona.nombre && t.estado !== 'Terminado').length
      return { persona, trabajosActivos, tareasAbiertas, puntaje: trabajosActivos * 2 + tareasAbiertas }
    })
  })
}

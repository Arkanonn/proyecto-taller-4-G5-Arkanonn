export function obtenerEstadoVotacion(fechaInicio, fechaTermino) {
  const ahora = Date.now();

  const inicio = new Date(fechaInicio).getTime();
  const termino = new Date(fechaTermino).getTime();

  if (
    !Number.isFinite(inicio) ||
    !Number.isFinite(termino) ||
    inicio >= termino
  ) {
    return "invalida";
  }

  if (ahora < inicio) {
    return "pendiente";
  }

  if (ahora >= termino) {
    return "finalizada";
  }

  return "activa";
}
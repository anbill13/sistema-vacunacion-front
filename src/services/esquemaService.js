// Servicio para obtener el esquema de vacunación desde el API
export async function getEsquemaVacunacion() {
  const res = await fetch('https://sistema-vacunacion-backend.onrender.com/api/vaccination-schedules');
  if (!res.ok) throw new Error('No se pudo obtener el esquema');
  return await res.json();
}

export const getPacientesCentro = (ninos, idCentro) => {
  return ninos
    .filter((nino) => nino.id_centro_salud === idCentro)
    .map((nino) => ({
      ...nino,
      nombre: nino.nombre_completo.split(" ")[0],
      apellido: nino.nombre_completo.split(" ").slice(1).join(" "),
    }));
};

export const getPacientesDelCentro = (ninos, centroId) => {
  return ninos.filter(nino => nino.centro_vacunacion === centroId);
};
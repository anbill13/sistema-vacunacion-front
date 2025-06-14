// Lista de provincias de República Dominicana
export const provinciasRD = [
  "Azua", "Baoruco", "Barahona", "Dajabón", "Distrito Nacional", "Duarte",
  "Elías Piña", "El Seibo", "Espaillat", "Hato Mayor", "Hermanas Mirabal",
  "Independencia", "La Altagracia", "La Romana", "La Vega", "María Trinidad Sánchez",
  "Monseñor Nouel", "Monte Cristi", "Monte Plata", "Pedernales", "Peravia",
  "Puerto Plata", "Samaná", "San Cristóbal", "San José de Ocoa", "San Juan",
  "San Pedro de Macorís", "Sánchez Ramírez", "Santiago", "Santiago Rodríguez",
  "Santo Domingo", "Valverde"
];

// Lista de sectores comunes en República Dominicana
export const sectoresRD = [
  "Arroyo Hondo", "Bella Vista", "Ciudad Nueva", "Ciudad Universitaria", "El Millón",
  "Ensanche Espaillat", "Ensanche La Fe", "Ensanche Naco", "Gazcue", "Honduras",
  "Jardín Botánico", "La Agustina", "La Esperilla", "La Julia", "Los Cacicazgos",
  "Los Jardines", "Los Prados", "Mata Hambre", "Mirador Norte", "Mirador Sur",
  "Paraíso", "Piantini", "Puerto", "San Carlos", "San Diego", "San Gerónimo",
  "San Juan Bosco", "Simón Bolívar", "Tropical", "Villa Consuelo", "Villa Francisca",
  "Villa Juana", "Zona Colonial", "Zona Industrial", "Zona Universitaria"
];

// Función para filtrar centros por diferentes criterios
export const filterCentros = (centros, filterTerm, filterType) => {
  if (!filterTerm || filterTerm.trim() === "") {
    return centros;
  }

  const term = filterTerm.toLowerCase();

  switch (filterType) {
    case "provincia":
      return centros.filter(centro => 
        centro.direccion && centro.direccion.toLowerCase().includes(term)
      );
    case "sector":
      return centros.filter(centro => 
        centro.direccion && centro.direccion.toLowerCase().includes(term)
      );
    case "director":
      return centros.filter(centro => 
        centro.director && centro.director.toLowerCase().includes(term)
      );
    default:
      return centros;
  }
};

// Función para obtener opciones de filtro según el tipo
export const getFilterOptions = (filterType, centros) => {
  switch (filterType) {
    case "provincia":
      return provinciasRD;
    case "sector":
      return sectoresRD;
    case "director":
      // Extraer directores únicos de los centros
      const directores = [...new Set(
        centros
          .filter(centro => centro.director)
          .map(centro => centro.director)
      )];
      return directores.sort();
    default:
      return [];
  }
};

// Función para obtener estadísticas de centros
export const getCentrosStats = (centros) => {
  return {
    total: centros.length,
    conDirector: centros.filter(centro => centro.director).length,
    sinDirector: centros.filter(centro => !centro.director).length,
    porProvincia: provinciasRD.map(provincia => ({
      nombre: provincia,
      cantidad: centros.filter(centro => 
        centro.direccion && centro.direccion.includes(provincia)
      ).length
    })).filter(item => item.cantidad > 0)
  };
};

// Función para validar datos de un centro
export const validateCentro = (centro) => {
  const errors = {};
  
  if (!centro.nombre_centro) {
    errors.nombre_centro = "El nombre del centro es requerido";
  }
  
  if (!centro.direccion) {
    errors.direccion = "La dirección es requerida";
  }
  
  if (!centro.telefono) {
    errors.telefono = "El teléfono es requerido";
  } else if (!/^\d{3}-\d{3}-\d{4}$/.test(centro.telefono)) {
    errors.telefono = "El formato debe ser XXX-XXX-XXXX";
  }
  
  if (centro.latitud && (isNaN(centro.latitud) || centro.latitud < -90 || centro.latitud > 90)) {
    errors.latitud = "La latitud debe ser un número entre -90 y 90";
  }
  
  if (centro.longitud && (isNaN(centro.longitud) || centro.longitud < -180 || centro.longitud > 180)) {
    errors.longitud = "La longitud debe ser un número entre -180 y 180";
  }
  
  if (centro.sitio_web && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(centro.sitio_web)) {
    errors.sitio_web = "El formato del sitio web no es válido";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
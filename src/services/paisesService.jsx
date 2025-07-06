// src/services/paisesService.jsx
export const paisesYGentilicios = [
  { codigo: 'DO', pais: 'República Dominicana', gentilicio: 'Dominicano/a' },
  { codigo: 'US', pais: 'Estados Unidos', gentilicio: 'Estadounidense' },
  { codigo: 'HT', pais: 'Haití', gentilicio: 'Haitiano/a' },
  { codigo: 'ES', pais: 'España', gentilicio: 'Español/a' },
  { codigo: 'FR', pais: 'Francia', gentilicio: 'Francés/a' },
  { codigo: 'IT', pais: 'Italia', gentilicio: 'Italiano/a' },
  { codigo: 'DE', pais: 'Alemania', gentilicio: 'Alemán/a' },
  { codigo: 'CO', pais: 'Colombia', gentilicio: 'Colombiano/a' },
  { codigo: 'VE', pais: 'Venezuela', gentilicio: 'Venezolano/a' },
  { codigo: 'AR', pais: 'Argentina', gentilicio: 'Argentino/a' },
  { codigo: 'BR', pais: 'Brasil', gentilicio: 'Brasileño/a' },
  { codigo: 'MX', pais: 'México', gentilicio: 'Mexicano/a' },
  { codigo: 'CU', pais: 'Cuba', gentilicio: 'Cubano/a' },
  { codigo: 'PR', pais: 'Puerto Rico', gentilicio: 'Puertorriqueño/a' },
  { codigo: 'JM', pais: 'Jamaica', gentilicio: 'Jamaicano/a' },
  { codigo: 'CA', pais: 'Canadá', gentilicio: 'Canadiense' },
  { codigo: 'GT', pais: 'Guatemala', gentilicio: 'Guatemalteco/a' },
  { codigo: 'HN', pais: 'Honduras', gentilicio: 'Hondureño/a' },
  { codigo: 'SV', pais: 'El Salvador', gentilicio: 'Salvadoreño/a' },
  { codigo: 'NI', pais: 'Nicaragua', gentilicio: 'Nicaragüense' },
  { codigo: 'CR', pais: 'Costa Rica', gentilicio: 'Costarricense' },
  { codigo: 'PA', pais: 'Panamá', gentilicio: 'Panameño/a' },
  { codigo: 'EC', pais: 'Ecuador', gentilicio: 'Ecuatoriano/a' },
  { codigo: 'PE', pais: 'Perú', gentilicio: 'Peruano/a' },
  { codigo: 'BO', pais: 'Bolivia', gentilicio: 'Boliviano/a' },
  { codigo: 'PY', pais: 'Paraguay', gentilicio: 'Paraguayo/a' },
  { codigo: 'UY', pais: 'Uruguay', gentilicio: 'Uruguayo/a' },
  { codigo: 'CL', pais: 'Chile', gentilicio: 'Chileno/a' },
  { codigo: 'CN', pais: 'China', gentilicio: 'Chino/a' },
  { codigo: 'JP', pais: 'Japón', gentilicio: 'Japonés/a' },
  { codigo: 'KR', pais: 'Corea del Sur', gentilicio: 'Coreano/a' },
  { codigo: 'IN', pais: 'India', gentilicio: 'Indio/a' },
  { codigo: 'GB', pais: 'Reino Unido', gentilicio: 'Británico/a' },
  { codigo: 'RU', pais: 'Rusia', gentilicio: 'Ruso/a' },
  { codigo: 'AU', pais: 'Australia', gentilicio: 'Australiano/a' }
];

const paisesService = {
  // Obtener todos los países
  getPaises() {
    return paisesYGentilicios.map(p => ({
      codigo: p.codigo,
      nombre: p.pais
    }));
  },

  // Obtener todos los gentilicios
  getGentilicios() {
    return paisesYGentilicios.map(p => ({
      codigo: p.codigo,
      gentilicio: p.gentilicio
    }));
  },

  // Obtener país por código
  getPaisPorCodigo(codigo) {
    return paisesYGentilicios.find(p => p.codigo === codigo);
  },

  // Buscar países por nombre
  buscarPaises(termino) {
    const terminoLower = termino.toLowerCase();
    return paisesYGentilicios.filter(p => 
      p.pais.toLowerCase().includes(terminoLower) ||
      p.gentilicio.toLowerCase().includes(terminoLower)
    );
  }
};

export default paisesService;

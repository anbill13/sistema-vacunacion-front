import React from 'react';
import { useData } from '../context/DataProvider';

const ExampleComponent = () => {
  const { useCentrosVacunacion } = useData();
  const { data: centros, loading, error } = useCentrosVacunacion();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {centros.map(centro => (
        <div key={centro.id_centro}>
          <h3>{centro.nombre_centro}</h3>
          <p>{centro.direccion}</p>
        </div>
      ))}
    </div>
  );
};

export default ExampleComponent;

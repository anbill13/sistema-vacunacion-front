import React, { useMemo } from 'react';
import { centrosService } from '../../services/centrosService';

const CentrosFilter = ({ filterType, setFilterType, filterTerm, setFilterTerm, centrosVacunacion }) => {
  const filterTypes = useMemo(() => [
    {
      value: "provincia",
      label: "Filtrar por Provincia",
      allLabel: "Todas las Provincias"
    },
    {
      value: "sector",
      label: "Filtrar por Sector",
      allLabel: "Todos los Sectores"
    },
    {
      value: "director",
      label: "Filtrar por Director",
      allLabel: "Todos los Directores"
    }
  ], []);

  const getCurrentFilterType = () => filterTypes.find(type => type.value === filterType);

  return (
    <div className="filter-container mb-4 p-4 border rounded-lg bg-light">
      <div className="d-flex flex-column flex-md-row gap-3">
        <select
          className="form-select"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setFilterTerm("");
          }}
        >
          {filterTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          value={filterTerm}
          onChange={(e) => setFilterTerm(e.target.value)}
        >
          <option value="">
            {getCurrentFilterType()?.allLabel}
          </option>
          {centrosService.getFilterOptions(filterType, centrosVacunacion).map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CentrosFilter;
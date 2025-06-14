import React from 'react';
import { getFilterOptions } from '../../services/centrosService';

const CentrosFilter = ({ filterType, setFilterType, filterTerm, setFilterTerm, centrosVacunacion }) => {
  return (
    <div className="filter-container mb-4 p-4 border rounded-lg bg-light">
      <div className="d-flex flex-column flex-md-row gap-3">
        <select
          className="form-select"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setFilterTerm(""); // Reset filter term when changing type
          }}
        >
          <option value="provincia">Filtrar por Provincia</option>
          <option value="sector">Filtrar por Sector</option>
          <option value="director">Filtrar por Director</option>
        </select>
        <select
          className="form-select"
          value={filterTerm}
          onChange={(e) => setFilterTerm(e.target.value)}
        >
          <option value="">
            {filterType === "provincia" ? "Todas las Provincias" : 
             filterType === "sector" ? "Todos los Sectores" : 
             "Todos los Directores"}
          </option>
          {getFilterOptions(filterType, centrosVacunacion).map((option, index) => (
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
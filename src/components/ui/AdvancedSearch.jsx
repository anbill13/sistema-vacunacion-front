// src/components/ui/AdvancedSearch.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Card,
  CardBody,
  Divider
} from "@nextui-org/react";

const AdvancedSearch = ({ 
  data = [], 
  onResults, 
  searchFields = [], 
  filters = [],
  placeholder = "Buscar...",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Función de búsqueda mejorada
  const filteredResults = useMemo(() => {
    if (!data || data.length === 0) return [];

    let results = [...data];

    // Aplicar búsqueda por texto
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(item => {
        return searchFields.some(field => {
          const value = getNestedValue(item, field);
          return value && value.toString().toLowerCase().includes(searchLower);
        });
      });
    }

    // Aplicar filtros
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue !== 'all') {
        results = results.filter(item => {
          const itemValue = getNestedValue(item, filterKey);
          if (Array.isArray(filterValue)) {
            return filterValue.includes(itemValue);
          }
          return itemValue === filterValue;
        });
      }
    });

    return results;
  }, [data, searchTerm, activeFilters, searchFields]);

  // Función para obtener valores anidados
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Notificar cambios en los resultados
  useEffect(() => {
    if (onResults) {
      onResults(filteredResults);
    }
  }, [filteredResults, onResults]);

  const handleFilterChange = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
  };

  const hasActiveFilters = searchTerm.trim() || Object.values(activeFilters).some(v => v && v !== 'all');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de búsqueda principal */}
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startContent={
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          endContent={
            searchTerm && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={() => setSearchTerm('')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            )
          }
          className="flex-1"
        />
        
        {filters.length > 0 && (
          <Button
            variant={showAdvanced ? "solid" : "bordered"}
            color="primary"
            onClick={() => setShowAdvanced(!showAdvanced)}
            startContent={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
            }
          >
            Filtros
          </Button>
        )}

        {hasActiveFilters && (
          <Button
            variant="light"
            color="danger"
            onClick={clearFilters}
            startContent={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && filters.length > 0 && (
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Filtros Avanzados</h4>
              <Chip size="sm" color="primary" variant="flat">
                {filteredResults.length} resultados
              </Chip>
            </div>
            <Divider className="mb-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {filter.label}
                  </label>
                  
                  {filter.type === 'select' && (
                    <Dropdown>
                      <DropdownTrigger>
                        <Button variant="bordered" className="w-full justify-between">
                          {activeFilters[filter.key] && activeFilters[filter.key] !== 'all' 
                            ? filter.options.find(opt => opt.value === activeFilters[filter.key])?.label || 'Seleccionar'
                            : 'Todos'
                          }
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        selectedKeys={activeFilters[filter.key] ? [activeFilters[filter.key]] : ['all']}
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0];
                          handleFilterChange(filter.key, selectedKey);
                        }}
                      >
                        <DropdownItem key="all">Todos</DropdownItem>
                        {filter.options.map((option) => (
                          <DropdownItem key={option.value}>
                            {option.label}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  )}

                  {filter.type === 'input' && (
                    <Input
                      placeholder={filter.placeholder || `Filtrar por ${filter.label.toLowerCase()}`}
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Chips de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Chip
              color="primary"
              variant="flat"
              onClose={() => setSearchTerm('')}
            >
              Búsqueda: "{searchTerm}"
            </Chip>
          )}
          
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || value === 'all') return null;
            
            const filter = filters.find(f => f.key === key);
            const displayValue = filter?.options?.find(opt => opt.value === value)?.label || value;
            
            return (
              <Chip
                key={key}
                color="secondary"
                variant="flat"
                onClose={() => handleFilterChange(key, null)}
              >
                {filter?.label}: {displayValue}
              </Chip>
            );
          })}
        </div>
      )}

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {filteredResults.length} de {data.length} resultados
          {hasActiveFilters && ' (filtrados)'}
        </span>
        
        {filteredResults.length === 0 && hasActiveFilters && (
          <Button
            size="sm"
            variant="light"
            color="primary"
            onClick={clearFilters}
          >
            Mostrar todos
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
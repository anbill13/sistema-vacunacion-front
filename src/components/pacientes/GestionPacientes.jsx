import React, { useState } from "react";
import Button from '../ui/Button';
import RegistroForm from './forms/RegistroForm';
import { useData } from '../../contexts/DataContext';

export default function GestionPacientes() {
  const { 
    ninos, 
    tutores, 
    vacunas, 
    lotesVacunas, 
    dosisAplicadas, 
    centrosVacunacion,
    handleUpdateNino,
    handleUpdateTutor,
    handleNinoAdd,
    handleTutorAdd
  } = useData();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("nombre");
  const [searchResults, setSearchResults] = useState([]);
  const [expandedNinoId, setExpandedNinoId] = useState(null);
  const [editingNino, setEditingNino] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }

    let results = [];
    switch (filterType) {
      case "nombre":
        results = ninos.filter((nino) =>
          nino.nombre_completo.toLowerCase().includes(term)
        );
        break;
      case "id":
        results = ninos.filter(
          (nino) => nino.id_niño.toString().includes(term)
        );
        break;
      case "tutor":
        const tutoresFiltered = tutores.filter(
          (tutor) =>
            tutor.nombre.toLowerCase().includes(term) ||
            tutor.apellido.toLowerCase().includes(term)
        );
        const tutorIds = tutoresFiltered.map((tutor) => tutor.id_tutor);
        results = ninos.filter((nino) => tutorIds.includes(nino.id_tutor));
        break;
      default:
        results = [];
    }

    setSearchResults(results);
  };

  const handleToggleExpand = (ninoId) => {
    setExpandedNinoId(expandedNinoId === ninoId ? null : ninoId);
  };

  const handleEditNino = (nino) => {
    setEditingNino(nino);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNino(null);
  };

  const getTutorNombre = (idTutor) => {
    const tutor = tutores.find((t) => t.id_tutor === idTutor);
    return tutor ? `${tutor.nombre} ${tutor.apellido}` : "No especificado";
  };

  const getHistorialVacunas = (ninoId) => {
    if (!dosisAplicadas) return [];
    const dosisDelNino = dosisAplicadas.filter(d => d.id_niño === ninoId);
    return dosisDelNino.map(dosis => {
      const lote = lotesVacunas.find(l => l.id_lote === dosis.id_lote);
      const vacuna = vacunas.find(v => v.id_vacuna === lote?.id_vacuna);
      return {
        ...dosis,
        nombre_vacuna: vacuna?.nombre_vacuna || 'Desconocida',
        numero_lote: lote?.numero_lote || 'N/A'
      };
    });
  };

  const getCentroNombre = (idCentro) => {
    const centro = centrosVacunacion.find(c => c.id_centro === idCentro);
    return centro ? centro.nombre_centro : "No especificado";
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>Gestión de Pacientes</h2>
          <p className="text-muted">
            Busca, visualiza y edita información de pacientes
          </p>
        </div>
        <div className="col-md-4 text-end">
          <Button
            className="btn-success"
            onClick={() => setIsModalOpen(true)}
          >
            + Registrar Nuevo Paciente
          </Button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="nombre">Buscar por Nombre</option>
                <option value="id">Buscar por ID</option>
                <option value="tutor">Buscar por Tutor</option>
              </select>
            </div>
            <div className="col-md-9">
              <input
                type="text"
                className="form-control"
                placeholder={`Ingrese ${
                  filterType === "nombre"
                    ? "nombre del paciente"
                    : filterType === "id"
                    ? "ID del paciente"
                    : "nombre del tutor"
                }`}
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>

      {searchResults.length > 0 ? (
        <div className="search-results">
          {searchResults.map((nino) => (
            <div key={nino.id_niño} className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{nino.nombre_completo}</h5>
                <div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="me-2"
                    onClick={() => handleToggleExpand(nino.id_niño)}
                  >
                    {expandedNinoId === nino.id_niño ? "Ocultar" : "Ver Detalles"}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleEditNino(nino)}
                  >
                    Editar
                  </Button>
                </div>
              </div>
              {expandedNinoId === nino.id_niño && (
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Información Personal</h6>
                      <p><strong>ID:</strong> {nino.id_niño}</p>
                      <p><strong>Fecha de Nacimiento:</strong> {nino.fecha_nacimiento}</p>
                      <p><strong>Género:</strong> {nino.genero}</p>
                      <p><strong>Dirección:</strong> {nino.direccion_residencia}</p>
                      <p><strong>Tutor:</strong> {getTutorNombre(nino.id_tutor)}</p>
                      <p><strong>Centro de Salud:</strong> {getCentroNombre(nino.id_centro_salud)}</p>
                    </div>
                    <div className="col-md-6">
                      <h6>Historial de Vacunación</h6>
                      {getHistorialVacunas(nino.id_niño).length > 0 ? (
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Vacuna</th>
                              <th>Fecha</th>
                              <th>Lote</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getHistorialVacunas(nino.id_niño).map((dosis, index) => (
                              <tr key={index}>
                                <td>{dosis.nombre_vacuna}</td>
                                <td>{dosis.fecha_aplicacion}</td>
                                <td>{dosis.numero_lote}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>No hay registros de vacunación</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : searchTerm.trim() !== "" ? (
        <div className="alert alert-info">
          No se encontraron resultados para la búsqueda.
        </div>
      ) : null}

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingNino ? "Editar Paciente" : "Registrar Nuevo Paciente"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <RegistroForm
                  onClose={handleCloseModal}
                  onNinoAdd={handleNinoAdd}
                  onTutorAdd={handleTutorAdd}
                  ninoToEdit={editingNino}
                  onUpdateNino={handleUpdateNino}
                  onUpdateTutor={handleUpdateTutor}
                  tutores={tutores}
                  centros={centrosVacunacion}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
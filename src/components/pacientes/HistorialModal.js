import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Modal, ModalBody, ModalHeader } from "../ui/Modal";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "../ui/Table";
import Button from "../ui/Button";

const HistorialModal = ({ isOpen, onClose, paciente }) => {
  const { getHistorialVacunas, getVacunasFaltantes } = useData();
  
  const historialVacunas = getHistorialVacunas(paciente.id_niño);
  const vacunasFaltantes = getVacunasFaltantes(paciente.id_niño);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="modal-header-content">
          <h4>Historial de Vacunación - {paciente.nombre_completo || `${paciente.nombre} ${paciente.apellido}`}</h4>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="historial-modal-content">
          <h5>Vacunas Aplicadas</h5>
          {historialVacunas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableColumn>Vacuna</TableColumn>
                  <TableColumn>Fecha</TableColumn>
                  <TableColumn>Lote</TableColumn>
                  <TableColumn>Dosis</TableColumn>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historialVacunas.map((dosis, index) => (
                  <TableRow key={index}>
                    <TableCell>{dosis.nombre_vacuna}</TableCell>
                    <TableCell>{dosis.fecha_aplicacion}</TableCell>
                    <TableCell>{dosis.numero_lote}</TableCell>
                    <TableCell>{dosis.numero_dosis}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No hay vacunas registradas para este paciente.</p>
          )}

          <h5 className="mt-4">Vacunas Pendientes</h5>
          {vacunasFaltantes.length > 0 ? (
            <ul className="list-group">
              {vacunasFaltantes.map((vacuna, index) => (
                <li key={index} className="list-group-item">
                  {vacuna}
                </li>
              ))}
            </ul>
          ) : (
            <p>El paciente tiene todas las vacunas requeridas.</p>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default HistorialModal;
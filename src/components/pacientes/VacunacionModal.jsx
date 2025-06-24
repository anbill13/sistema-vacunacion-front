import React, { useState } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Select, SelectItem, Textarea, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, DatePicker, TimeInput
} from "@nextui-org/react";
import RegistrarVacunacionModal from '../vacunacion/RegistrarVacunacionModal';
import { getEsquemaVacunacion } from '../../services/esquemaService';

export default function VacunacionModal({
  open,
  onClose,
  paciente,
  vacunas,
  lotesVacunas,
  historialVacunas = [],
  citas = [],
  onRegistrarVacuna,
  onRegistrarCita,
  onEditarCita,
  onEliminarCita,
  loading
}) {
  // const [vacunaId, setVacunaId] = useState("");
  // const [loteId, setLoteId] = useState("");
  const [citaFecha, setCitaFecha] = useState(null);
  const [citaHora, setCitaHora] = useState(null);
  const [citaVacunaId, setCitaVacunaId] = useState("");
  const [citaNotas, setCitaNotas] = useState("");
  const [editCitaId, setEditCitaId] = useState(null);
  const [editCitaData, setEditCitaData] = useState(null);
  const [showRegistrar, setShowRegistrar] = useState(false);
  const [esquema, setEsquema] = useState([]);

  React.useEffect(() => {
    if (open) {
      // if (vacunas && vacunas.length === 1) {
      //   setVacunaId(vacunas[0].id_vacuna);
      // } else {
      //   setVacunaId("");
      // }
      // setLoteId("");
    }
  }, [open, paciente, vacunas]);

  // Removed loteId effect as loteId is not used

  React.useEffect(() => {
    if (open) {
      getEsquemaVacunacion().then(setEsquema).catch(() => setEsquema([]));
    }
  }, [open]);

  const handleEditCita = (cita) => {
    setEditCitaId(cita.id);
    setEditCitaData({ ...cita });
    setCitaFecha(new Date(cita.fecha));
    setCitaHora(cita.hora);
    setCitaVacunaId(cita.vacunaId);
    setCitaNotas(cita.notas || "");
  };

  const handleSaveEditCita = () => {
    if (!editCitaId) return;
    onEditarCita(editCitaId, {
      ...editCitaData,
      fecha: citaFecha,
      hora: citaHora,
      vacunaId: citaVacunaId,
      notas: citaNotas,
    });
    setEditCitaId(null);
    setEditCitaData(null);
    setCitaFecha(null);
    setCitaHora(null);
    setCitaVacunaId("");
    setCitaNotas("");
  };


  const now = new Date();
  const proximaCita = Array.isArray(citas)
    ? citas
        .filter(cita => cita.fecha && new Date(cita.fecha) > now)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0]
    : null;

  return (
    <>
      <Modal isOpen={open} onClose={onClose} size="2xl" scrollBehavior="inside" backdrop="blur">
        <ModalContent>
          <ModalHeader>
            Registrar Vacunación y Próxima Cita
          </ModalHeader>
          <ModalBody>
            {/* Próxima cita destacada */}
            {proximaCita && (
              <div className="mb-4 p-3 rounded-lg bg-primary-100 dark:bg-primary-900/40 border border-primary-300 dark:border-primary-700">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <span className="font-semibold text-primary-800 dark:text-primary-200">Próxima cita:</span>
                  <span className="font-medium">{new Date(proximaCita.fecha).toLocaleString()}</span>
                  <span className="font-medium">Vacuna: {vacunas.find(v => v.id_vacuna === proximaCita.vacunaId)?.nombre_vacuna || ''}</span>
                </div>
              </div>
            )}
            <div className="mb-4">
              <h5 className="font-semibold mb-2">Historial de Vacunas Recientes</h5>
              {historialVacunas.length > 0 ? (
                <Table aria-label="Historial de vacunación" isStriped removeWrapper>
                  <TableHeader>
                    <TableColumn>Vacuna</TableColumn>
                    <TableColumn>Fecha</TableColumn>
                    <TableColumn>Lote</TableColumn>
                    <TableColumn>Notas</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {historialVacunas.slice(-5).reverse().map((dosis, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{dosis.nombre_vacuna}</TableCell>
                        <TableCell>{dosis.fecha_aplicacion ? new Date(dosis.fecha_aplicacion).toLocaleString() : ""}</TableCell>
                        <TableCell>{dosis.numero_lote || "N/A"}</TableCell>
                        <TableCell>{dosis.notas || ""}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-default-400">No hay historial de vacunación registrado.</p>
              )}
            </div>

            <div className="mb-4">
              <h5 className="font-semibold mb-2">Próximas Citas</h5>
              {citas.length > 0 ? (
                <Table aria-label="Citas futuras" isStriped removeWrapper>
                  <TableHeader>
                    <TableColumn>Vacuna</TableColumn>
                    <TableColumn>Fecha</TableColumn>
                    <TableColumn>Notas</TableColumn>
                    <TableColumn>Acciones</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {citas.map((cita, idx) => (
                      <TableRow key={cita.id || idx}>
                        <TableCell>{vacunas.find(v => v.id_vacuna === cita.vacunaId)?.nombre_vacuna || ""}</TableCell>
                        <TableCell>{cita.fecha ? new Date(cita.fecha).toLocaleString() : ""}</TableCell>
                        <TableCell>{cita.notas || ""}</TableCell>
                        <TableCell>
                          <Button size="sm" color="primary" variant="flat" onClick={() => handleEditCita(cita)} className="mr-1">Editar</Button>
                          <Button size="sm" color="danger" variant="flat" onClick={() => onEliminarCita(cita.id)}>Cancelar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-default-400">No hay citas futuras registradas.</p>
              )}
            </div>

            {/* Modal de edición de cita */}
            {editCitaId && (
              <div className="mb-4 border-t pt-4 mt-4">
                <h5 className="font-semibold mb-2">Editar Cita</h5>
                <div className="flex gap-2 mb-2">
                  <DatePicker
                    label="Fecha de la cita"
                    value={citaFecha}
                    onChange={setCitaFecha}
                    required
                  />
                  <TimeInput
                    label="Hora de la cita"
                    value={citaHora}
                    onChange={setCitaHora}
                    required
                  />
                </div>
                <Select
                  label="Vacuna a aplicar"
                  value={citaVacunaId}
                  onChange={e => setCitaVacunaId(e.target.value)}
                  className="mb-2"
                  required
                >
                  {vacunas.map(v => (
                    <SelectItem key={v.id_vacuna} value={v.id_vacuna}>{v.nombre_vacuna}</SelectItem>
                  ))}
                </Select>
                <Textarea
                  label="Notas para la cita (opcional)"
                  value={citaNotas}
                  onChange={e => setCitaNotas(e.target.value)}
                  className="mb-2"
                />
                <Button color="primary" onClick={handleSaveEditCita} isDisabled={!citaFecha || !citaHora || !citaVacunaId || loading} className="mr-2">Guardar Cambios</Button>
                <Button color="default" variant="flat" onClick={() => setEditCitaId(null)}>Cancelar</Button>
              </div>
            )}

            <Button color="primary" onClick={() => setShowRegistrar(true)} fullWidth>
              Registrar nueva vacunación (flujo inteligente)
            </Button>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="flat" onClick={onClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <RegistrarVacunacionModal
        isOpen={showRegistrar}
        onClose={() => setShowRegistrar(false)}
        paciente={paciente}
        esquema={esquema}
        onVacunacionRegistrada={() => {
          // Callback cuando se registra la vacunación exitosamente
          // Podrías actualizar el estado aquí si necesitas refrescar datos
          setShowRegistrar(false);
        }}
      />
    </>
  );
}

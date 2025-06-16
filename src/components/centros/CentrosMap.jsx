<<<<<<< HEAD
import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@nextui-org/react";
import L from 'leaflet';
=======
import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Button from "../ui/Button";
>>>>>>> develop

const CentrosMap = ({ 
  filteredCentros, 
  handleCentroClick, 
  handleVerPacientes, 
  currentUser 
}) => {
  const mapRef = useRef(null);
<<<<<<< HEAD
  
  // Fix para el icono de Leaflet
  useEffect(() => {
    // Solución para el problema del icono de marcador en Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);
=======
>>>>>>> develop

  return (
    <div className="map-container">
      <MapContainer
        center={[18.7357, -70.1627]} // Centro de República Dominicana
        zoom={8}
        style={{ height: "500px", width: "100%" }}
<<<<<<< HEAD
        ref={mapRef}
=======
        whenCreated={(map) => {
          mapRef.current = map;
        }}
>>>>>>> develop
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {filteredCentros.map((centro) => (
          <Marker
            key={centro.id_centro}
            position={[
              centro.latitud || 18.7357,
              centro.longitud || -70.1627,
            ]}
            eventHandlers={{
              click: () => handleCentroClick(centro),
            }}
          >
            <Popup>
              <div className="popup-content">
                <h5>{centro.nombre_centro}</h5>
                <p>
                  <strong>Dirección:</strong> {centro.direccion}
                </p>
                <p>
                  <strong>Teléfono:</strong> {centro.telefono}
                </p>
                <p>
                  <strong>Director:</strong> {centro.director || "No asignado"}
                </p>
                {(currentUser?.role === 'doctor' || 
                  currentUser?.role === 'administrador' || 
                  currentUser?.role === 'director') && (
                  <Button
<<<<<<< HEAD
                    color="primary"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => handleVerPacientes(null, centro)}
=======
                    className="btn-sm btn-primary w-100 mt-2"
                    onClick={(e) => handleVerPacientes(e, centro)}
>>>>>>> develop
                  >
                    Ver Pacientes
                  </Button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CentrosMap;
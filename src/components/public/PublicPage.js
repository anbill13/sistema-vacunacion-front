import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useData } from '../../contexts/DataContext';
import { getFilterOptions } from '../../services/centrosService';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const PublicPage = ({ onShowAuth }) => {
  const { centrosVacunacion = [] } = useData();
  const [filterTerm, setFilterTerm] = useState("");
  const [filterType, setFilterType] = useState("provincia");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'list'
  const mapRef = useRef(null);
  
  // Debug
  console.log("PublicPage rendered with centros:", centrosVacunacion.length);

  // Dark mode effects
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('publicDarkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('publicDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleCentroClick = (centro) => {
    if (mapRef.current) {
      const map = mapRef.current;
      const lat = centro.latitud || 18.7357;
      const lng = centro.longitud || -70.1627;
      map.setView([lat, lng], 15, {
        animate: true,
        duration: 1,
      });
      setActiveTab('map'); // Switch to map view when a center is clicked
    }
  };

  const filteredCentros = filterTerm.trim() === ""
    ? centrosVacunacion
    : centrosVacunacion.filter((centro) => {
        const valueToFilter = (() => {
          switch (filterType) {
            case "provincia":
            case "sector":
              return centro.direccion || "";
            case "director":
              return centro.director || "";
            default:
              return "";
          }
        })();
        return valueToFilter.toLowerCase().includes(filterTerm.toLowerCase());
      });

  return (
    <div className="public-page">
      {/* Modern Navbar */}
      <nav className="modern-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <h1>Sistema de Vacunación</h1>
            <p>República Dominicana</p>
          </div>
          <div className="navbar-actions">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="icon-button"
              aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <Button 
              className="login-button"
              onClick={onShowAuth}
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h2>Encuentra centros de vacunación cerca de ti</h2>
          <p>Localiza fácilmente los centros de vacunación disponibles en todo el país</p>
        </div>
      </div>

      <div className="container">
        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-container">
            <div className="filter-group">
              <label htmlFor="filterType">Filtrar por:</label>
              <select
                id="filterType"
                className="filter-select"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setFilterTerm(""); // Reset filter term when changing type
                }}
              >
                <option value="provincia">Provincia</option>
                <option value="sector">Sector</option>
                <option value="director">Director</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filterValue">Seleccionar:</label>
              <select
                id="filterValue"
                className="filter-select"
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
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button 
            className={`toggle-button ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <i className="fas fa-map-marked-alt"></i> Mapa
          </button>
          <button 
            className={`toggle-button ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <i className="fas fa-list"></i> Lista
          </button>
        </div>

        {/* Content Section */}
        <div className="content-section">
          {/* Map View */}
          <div className={`map-view ${activeTab === 'map' ? 'active' : ''}`}>
            <MapContainer
              center={[18.7357, -70.1627]} // Centro de República Dominicana
              zoom={8}
              style={{ height: "600px", width: "100%", borderRadius: "12px" }}
              whenCreated={(map) => {
                mapRef.current = map;
              }}
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
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* List View */}
          <div className={`list-view ${activeTab === 'list' ? 'active' : ''}`}>
            <div className="centros-grid">
              {filteredCentros.length > 0 ? (
                filteredCentros.map((centro) => (
                  <div
                    key={centro.id_centro}
                    className="centro-card"
                    onClick={() => handleCentroClick(centro)}
                  >
                    <div className="centro-card-header">
                      <h3>{centro.nombre_centro}</h3>
                    </div>
                    <div className="centro-card-body">
                      <div className="centro-info">
                        <div className="info-item">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>{centro.direccion}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-phone"></i>
                          <span>{centro.telefono}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-user-md"></i>
                          <span>{centro.director || "No asignado"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>No se encontraron centros con los filtros seleccionados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="modern-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Sistema de Vacunación - República Dominicana</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;
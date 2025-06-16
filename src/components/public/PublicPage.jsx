import React, { useState, useRef, useEffect } from 'react';
<<<<<<< HEAD
=======
import Button from '../ui/Button';
>>>>>>> develop
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useData } from '../../contexts/DataContext';
import { centrosService } from '../../services/centrosService';
<<<<<<< HEAD
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  Button, 
  Switch, 
  Card, 
  CardBody, 
  CardHeader, 
  Select, 
  SelectItem, 
  Tabs, 
  Tab, 
  Divider,
  Chip
} from "@nextui-org/react";
import { SunIcon, MoonIcon } from '../layout/Icons';
=======
>>>>>>> develop

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
<<<<<<< HEAD
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
=======
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
>>>>>>> develop
});

const PublicPage = ({ onShowAuth }) => {
  const { centrosVacunacion = [] } = useData();
  const [filterTerm, setFilterTerm] = useState("");
  const [filterType, setFilterType] = useState("provincia");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'list'
  const mapRef = useRef(null);
<<<<<<< HEAD
=======
  
  // Debug
  console.log("PublicPage rendered with centros:", centrosVacunacion.length);
>>>>>>> develop

  // Dark mode effects
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('publicDarkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
<<<<<<< HEAD
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
=======
      document.body.classList.add('dark-mode');
    } else {
>>>>>>> develop
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
<<<<<<< HEAD
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar 
        className="shadow-md" 
        maxWidth="full" 
        position="static"
        isBordered
      >
        <NavbarBrand>
          <div className="flex flex-col">
            <p className="font-bold text-inherit text-xl">Sistema de Vacunación</p>
            <p className="text-sm text-default-500">República Dominicana</p>
          </div>
        </NavbarBrand>

        <NavbarContent justify="end">
          <Switch
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            size="lg"
            color="secondary"
            startContent={<SunIcon />}
            endContent={<MoonIcon />}
          />
          <Button 
            color="primary" 
            variant="flat"
            onPress={onShowAuth}
          >
            Iniciar Sesión
          </Button>
        </NavbarContent>
      </Navbar>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Encuentra centros de vacunación cerca de ti</h2>
        <p className="text-xl">Localiza fácilmente los centros de vacunación disponibles en todo el país</p>
      </div>

      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Filter Section */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4">
              <Select
                label="Filtrar por"
                placeholder="Selecciona un tipo de filtro"
                selectedKeys={[filterType]}
                className="md:max-w-xs"
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setFilterTerm("");
                }}
              >
                <SelectItem key="provincia" value="provincia">Provincia</SelectItem>
                <SelectItem key="sector" value="sector">Sector</SelectItem>
                <SelectItem key="director" value="director">Director</SelectItem>
              </Select>
              
              <Select
                label="Seleccionar"
                placeholder={
                  filterType === "provincia" ? "Todas las Provincias" : 
                  filterType === "sector" ? "Todos los Sectores" : 
                  "Todos los Directores"
                }
                selectedKeys={filterTerm ? [filterTerm] : []}
                className="md:max-w-xs flex-grow"
                onChange={(e) => setFilterTerm(e.target.value)}
              >
                <SelectItem key="" value="">
                  {filterType === "provincia" ? "Todas las Provincias" : 
                  filterType === "sector" ? "Todos los Sectores" : 
                  "Todos los Directores"}
                </SelectItem>
                {centrosService.getFilterOptions(filterType, centrosVacunacion).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* View Toggle */}
        <Tabs 
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          aria-label="Vista de centros"
          className="mb-6"
          color="primary"
          variant="bordered"
        >
          <Tab key="map" title="Mapa" />
          <Tab key="list" title="Lista" />
        </Tabs>
=======
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
                {centrosService.getFilterOptions(filterType, centrosVacunacion).map((option, index) => (
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
>>>>>>> develop

        {/* Content Section */}
        <div className="content-section">
          {/* Map View */}
<<<<<<< HEAD
          {activeTab === 'map' && (
            <Card className="overflow-hidden">
              <CardBody className="p-0">
                <MapContainer
                  center={[18.7357, -70.1627]} // Centro de República Dominicana
                  zoom={8}
                  style={{ height: "600px", width: "100%" }}
                  ref={mapRef}
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
                          <h5 className="font-bold">{centro.nombre_centro}</h5>
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
              </CardBody>
            </Card>
          )}

          {/* List View */}
          {activeTab === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCentros.length > 0 ? (
                filteredCentros.map((centro) => (
                  <div key={centro.id_centro} className="h-full">
                    <Card 
                      isPressable
                      onPress={() => handleCentroClick(centro)}
                      className="h-full"
                      shadow="sm"
                    >
                      <CardHeader className="flex gap-3 bg-primary-50 dark:bg-primary-900/20">
                        <div className="flex flex-col">
                          <p className="text-lg font-semibold">{centro.nombre_centro}</p>
                          <p className="text-small text-default-500">{centro.nombre_corto || "Sin nombre corto"}</p>
                        </div>
                      </CardHeader>
                      <Divider />
                      <CardBody>
                        <div className="space-y-2">
                          <p>
                            <span className="font-semibold">Dirección:</span> {centro.direccion}
                          </p>
                          <p>
                            <span className="font-semibold">Teléfono:</span> {centro.telefono}
                          </p>
                          <p>
                            <span className="font-semibold">Director:</span> {centro.director || "No asignado"}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <Chip color="warning" variant="flat" size="lg">
                    No se encontraron centros con los filtros seleccionados
                  </Chip>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="bg-primary-50 dark:bg-primary-900/20 py-6 text-center mt-auto">
        <p>© {new Date().getFullYear()} Sistema de Vacunación - República Dominicana</p>
=======
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
>>>>>>> develop
      </footer>
    </div>
  );
};

export default PublicPage;
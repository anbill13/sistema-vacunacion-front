import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useData } from '../../context/DataContext';
import { centrosService } from '../../services/centrosService';
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

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PublicPage = ({ onShowAuth }) => {
  const { centrosVacunacion = [] } = useData();
  const [filterTerm, setFilterTerm] = useState("");
  const [filterType, setFilterType] = useState("provincia");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'list'
  const mapRef = useRef(null);

  // Dark mode effects
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('publicDarkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
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

        {/* Content Section */}
        <div className="content-section">
          {/* Map View */}
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
      </footer>
    </div>
  );
};

export default PublicPage;
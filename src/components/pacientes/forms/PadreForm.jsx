import React from 'react';
<<<<<<< HEAD
import { Input, Select, SelectItem } from "@nextui-org/react";

function PadreForm({ formData, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        type="text"
        label="Nombre Completo"
        name="nombre_completo"
        value={formData.nombre_completo}
        onChange={handleChange}
        placeholder="Ingrese el nombre completo del tutor"
        isRequired
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">👤</span>
        }
      />
      
      <Input
        type="text"
        label="Identificación"
        name="identificacion"
        value={formData.identificacion}
        onChange={handleChange}
        placeholder="Número de identificación"
        isRequired
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">🪪</span>
        }
      />
      
      <Input
        type="tel"
        label="Teléfono"
        name="telefono"
        value={formData.telefono}
        onChange={handleChange}
        placeholder="Número de teléfono"
        isRequired
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">📞</span>
        }
      />
      
      <Input
        type="email"
        label="Correo Electrónico"
        name="correo_electronico"
        value={formData.correo_electronico}
        onChange={handleChange}
        placeholder="Dirección de correo electrónico"
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">📧</span>
        }
      />
      
      <Input
        type="text"
        label="Dirección"
        name="direccion"
        value={formData.direccion}
        onChange={handleChange}
        placeholder="Dirección completa"
        isRequired
        variant="bordered"
        className="md:col-span-2"
        startContent={
          <span className="text-default-400 text-small">📍</span>
        }
      />
      
      <Select
        label="Relación con el Niño"
        name="relacion"
        selectedKeys={formData.relacion ? [formData.relacion] : []}
        onChange={handleChange}
        isRequired
        variant="bordered"
        placeholder="Seleccione relación"
        className="md:col-span-2"
        startContent={
          <span className="text-default-400 text-small">👨‍👧</span>
        }
      >
        <SelectItem key="Padre" value="Padre">Padre</SelectItem>
        <SelectItem key="Madre" value="Madre">Madre</SelectItem>
        <SelectItem key="Abuelo/a" value="Abuelo/a">Abuelo/a</SelectItem>
        <SelectItem key="Tío/a" value="Tío/a">Tío/a</SelectItem>
        <SelectItem key="Tutor Legal" value="Tutor Legal">Tutor Legal</SelectItem>
        <SelectItem key="Otro" value="Otro">Otro</SelectItem>
      </Select>
=======

function PadreForm({ formData, handleChange }) {
  return (
    <div className="row">
      <div className="col-md-6">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-user-tie me-2"></i>
            Nombre Completo *
          </label>
          <input
            type="text"
            className="form-control"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            placeholder="Ingrese el nombre completo del tutor"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-id-card me-2"></i>
            Identificación *
          </label>
          <input
            type="text"
            className="form-control"
            name="identificacion"
            value={formData.identificacion}
            onChange={handleChange}
            placeholder="Número de identificación"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-phone me-2"></i>
            Teléfono *
          </label>
          <input
            type="tel"
            className="form-control"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Número de teléfono"
            required
          />
        </div>
      </div>
      
      <div className="col-md-6">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-envelope me-2"></i>
            Correo Electrónico
          </label>
          <input
            type="email"
            className="form-control"
            name="correo_electronico"
            value={formData.correo_electronico}
            onChange={handleChange}
            placeholder="Dirección de correo electrónico"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-map-marker-alt me-2"></i>
            Dirección *
          </label>
          <input
            type="text"
            className="form-control"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Dirección completa"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-user-friends me-2"></i>
            Relación con el Niño *
          </label>
          <select
            className="form-select"
            name="relacion"
            value={formData.relacion}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione relación</option>
            <option value="Padre">Padre</option>
            <option value="Madre">Madre</option>
            <option value="Abuelo/a">Abuelo/a</option>
            <option value="Tío/a">Tío/a</option>
            <option value="Tutor Legal">Tutor Legal</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>
>>>>>>> develop
    </div>
  );
}

export default PadreForm;
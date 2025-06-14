import React from 'react';

function NinoForm({ formData, handleChange, centros }) {
  return (
    <div className="row">
      <div className="col-md-6">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-user me-2"></i>
            Nombre Completo *
          </label>
          <input
            type="text"
            className="form-control"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            placeholder="Ingrese el nombre completo"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-calendar me-2"></i>
            Fecha de Nacimiento *
          </label>
          <input
            type="date"
            className="form-control"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-venus-mars me-2"></i>
            Género *
          </label>
          <select
            className="form-select"
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>
      
      <div className="col-md-6">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-id-card me-2"></i>
            Identificación
          </label>
          <input
            type="text"
            className="form-control"
            name="identificacion"
            value={formData.identificacion}
            onChange={handleChange}
            placeholder="Número de identificación (si aplica)"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-map-marker-alt me-2"></i>
            Dirección de Residencia *
          </label>
          <input
            type="text"
            className="form-control"
            name="direccion_residencia"
            value={formData.direccion_residencia}
            onChange={handleChange}
            placeholder="Ingrese la dirección completa"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-flag me-2"></i>
            Nacionalidad *
          </label>
          <input
            type="text"
            className="form-control"
            name="nacionalidad"
            value={formData.nacionalidad}
            onChange={handleChange}
            placeholder="Ingrese la nacionalidad"
            required
          />
        </div>
      </div>
      
      <div className="col-12">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-globe-americas me-2"></i>
            País de Nacimiento *
          </label>
          <input
            type="text"
            className="form-control"
            name="pais_nacimiento"
            value={formData.pais_nacimiento}
            onChange={handleChange}
            placeholder="Ingrese el país de nacimiento"
            required
          />
        </div>
      </div>
      
      <div className="col-md-6">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-hospital me-2"></i>
            Centro de Salud *
          </label>
          <select
            className="form-select"
            name="id_centro_salud"
            value={formData.id_centro_salud}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un centro</option>
            {centros && centros.map((centro) => (
              <option key={centro.id_centro} value={centro.id_centro}>
                {centro.nombre_centro}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="col-md-6">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-phone me-2"></i>
            Contacto Principal
          </label>
          <input
            type="tel"
            className="form-control"
            name="contacto_principal"
            value={formData.contacto_principal}
            onChange={handleChange}
            placeholder="Número de teléfono de contacto"
          />
        </div>
      </div>
      
      <div className="col-12">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-medkit me-2"></i>
            ID Salud Nacional
          </label>
          <input
            type="text"
            className="form-control"
            name="id_salud_nacional"
            value={formData.id_salud_nacional}
            onChange={handleChange}
            placeholder="Número de identificación del sistema de salud (si aplica)"
          />
        </div>
      </div>
    </div>
  );
}

export default NinoForm;
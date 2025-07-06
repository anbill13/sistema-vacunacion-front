import React from 'react';
import { Input, Select, SelectItem } from "@nextui-org/react";
import paisesService from '../../../services/paisesService.jsx';

function NinoForm({ formData, handleChange, handleSelectChange, centros }) {
  const paises = paisesService.getPaises();
  const gentilicios = paisesService.getGentilicios();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        type="text"
        label="Nombre Completo"
        name="nombre_completo"
        value={formData.nombre_completo || ""}
        onChange={handleChange}
        placeholder="Ingrese el nombre completo"
        isRequired
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">👤</span>
        }
      />
      
      <Input
        type="date"
        label="Fecha de Nacimiento"
        name="fecha_nacimiento"
        value={formData.fecha_nacimiento || ""}
        onChange={handleChange}
        isRequired
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">📅</span>
        }
      />
      
      <Select
        label="Género"
        name="genero"
        selectedKeys={formData.genero ? [formData.genero] : []}
        onSelectionChange={(keys) => handleSelectChange("genero", keys)}
        isRequired
        variant="bordered"
        placeholder="Seleccione género"
        startContent={
          <span className="text-default-400 text-small">⚥</span>
        }
      >
        <SelectItem key="M" value="M">Masculino</SelectItem>
        <SelectItem key="F" value="F">Femenino</SelectItem>
        <SelectItem key="O" value="O">Otro</SelectItem>
      </Select>
      
      <Input
        type="text"
        label="Identificación"
        name="identificacion"
        value={formData.identificacion || ""}
        onChange={handleChange}
        placeholder="Número de identificación (si aplica)"
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">🪪</span>
        }
      />
      
      <Input
        type="text"
        label="Dirección de Residencia"
        name="direccion_residencia"
        value={formData.direccion_residencia || ""}
        onChange={handleChange}
        placeholder="Ingrese la dirección completa"
        isRequired
        variant="bordered"
        className="md:col-span-2"
        startContent={
          <span className="text-default-400 text-small">📍</span>
        }
      />
      
      <Select
        label="Nacionalidad (Gentilicio)"
        name="nacionalidad"
        selectedKeys={formData.nacionalidad ? [formData.nacionalidad] : []}
        onSelectionChange={(keys) => handleSelectChange("nacionalidad", keys)}
        isRequired
        variant="bordered"
        placeholder="Seleccione la nacionalidad"
        className="max-h-[200px]"
        scrollShadowProps={{
          isEnabled: false
        }}
        startContent={
          <span className="text-default-400 text-small">🏳️</span>
        }
      >
        {gentilicios.map((item) => (
          <SelectItem key={item.gentilicio} value={item.gentilicio}>
            {item.gentilicio}
          </SelectItem>
        ))}
      </Select>
      
      <Select
        label="País de Nacimiento"
        name="pais_nacimiento"
        selectedKeys={formData.pais_nacimiento ? [formData.pais_nacimiento] : []}
        onSelectionChange={(keys) => handleSelectChange("pais_nacimiento", keys)}
        isRequired
        variant="bordered"
        placeholder="Seleccione el país de nacimiento"
        className="max-h-[200px]"
        scrollShadowProps={{
          isEnabled: false
        }}
        startContent={
          <span className="text-default-400 text-small">🌎</span>
        }
      >
        {paises.map((item) => (
          <SelectItem key={item.nombre} value={item.nombre}>
            {item.nombre}
          </SelectItem>
        ))}
      </Select>
      
      <Select
        label="Centro de Salud"
        name="id_centro_salud"
        selectedKeys={formData.id_centro_salud ? [formData.id_centro_salud] : []}
        onSelectionChange={(keys) => handleSelectChange("id_centro_salud", keys)}
        isRequired
        variant="bordered"
        placeholder="Seleccione un centro"
        startContent={
          <span className="text-default-400 text-small">🏥</span>
        }
      >
        {centros && centros.map((centro) => (
          <SelectItem key={centro.id_centro} value={centro.id_centro}>
            {centro.nombre_centro}
          </SelectItem>
        ))}
      </Select>
      
      <Input
        type="tel"
        label="Contacto Principal"
        name="contacto_principal"
        value={formData.contacto_principal || ""}
        onChange={handleChange}
        placeholder="Número de teléfono de contacto"
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">📞</span>
        }
      />
      
      <Input
        type="text"
        label="ID Salud Nacional"
        name="id_salud_nacional"
        value={formData.id_salud_nacional || ""}
        onChange={handleChange}
        placeholder="Número de identificación del sistema de salud (si aplica)"
        variant="bordered"
        className="md:col-span-2"
        startContent={
          <span className="text-default-400 text-small">🏥</span>
        }
      />
    </div>
  );
}

export default NinoForm;
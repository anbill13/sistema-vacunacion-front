import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import jsPDF from 'jspdf';

const ManualUsuario = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      // Configurar fuentes
      doc.setFont("helvetica");
      
      // Portada
      doc.setFontSize(24);
      doc.setTextColor(0, 102, 204);
      doc.text('Manual de Usuario', pageWidth / 2, 40, { align: 'center' });
      
      doc.setFontSize(18);
      doc.setTextColor(51, 51, 51);
      doc.text('Sistema de Vacunación Pediátrica', pageWidth / 2, 55, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(102, 102, 102);
      doc.text('Versión 2.1.0 - Diciembre 2024', pageWidth / 2, 70, { align: 'center' });
      
      // Agregar logo o imagen (opcional)
      doc.setFillColor(0, 102, 204);
      doc.circle(pageWidth / 2, 100, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('💉', pageWidth / 2, 105, { align: 'center' });
      
      // Nueva página para contenido
      doc.addPage();
      
      let yPosition = margin;
      
      // Función para agregar texto con salto de página automático
      const addText = (text, fontSize = 12, isBold = false, color = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        
        const lines = doc.splitTextToSize(text, maxWidth);
        const lineHeight = fontSize * 0.5;
        
        if (yPosition + (lines.length * lineHeight) > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        lines.forEach(line => {
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
        
        yPosition += 5; // Espacio extra después del texto
      };
      
      // Contenido del manual
      const content = [
        {
          title: "Índice",
          content: `1. Introducción
2. Primeros Pasos
3. Roles de Usuario
4. Gestión de Pacientes
5. Centros de Vacunación
6. Esquema de Vacunación
7. Consulta de Vacunas
8. Panel de Padres
9. Reportes y Estadísticas
10. Solución de Problemas`
        },
        {
          title: "1. Introducción",
          content: `El Sistema de Vacunación Pediátrica es una plataforma integral diseñada para gestionar y seguir el esquema de vacunación de niños.

Características Principales:
• Interfaz moderna y responsiva
• Múltiples roles de usuario (Admin, Director, Doctor, Padre)
• Esquema de vacunación automatizado
• Alertas y recordatorios
• Historial completo de vacunación
• Reportes estadísticos

El sistema permite:
• Registro y seguimiento de pacientes
• Gestión de esquemas de vacunación
• Control de inventarios de vacunas
• Programación de citas
• Generación de reportes
• Acceso para padres de familia`
        },
        {
          title: "2. Primeros Pasos",
          content: `ACCESO AL SISTEMA:
1. Abra su navegador web e ingrese a la URL del sistema
2. Verá la pantalla de inicio de sesión
3. Si no tiene cuenta, haga clic en "Registrarse"

REGISTRO DE USUARIO:
Para registrarse como nuevo usuario:
1. Haga clic en "Registrarse"
2. Complete el formulario con:
   - Nombre completo
   - Nombre de usuario (único)
   - Correo electrónico
   - Contraseña (mínimo 6 caracteres)
   - Rol (Padre, Doctor, Director, Admin)
   - Centro de salud (si aplica)
3. Haga clic en "Registrarse"
4. El sistema lo redirigirá al panel principal

INICIO DE SESIÓN:
Si ya tiene cuenta:
1. Ingrese su nombre de usuario
2. Ingrese su contraseña
3. Haga clic en "Iniciar Sesión"`
        },
        {
          title: "3. Roles de Usuario",
          content: `PADRE DE FAMILIA:
Permisos:
• Ver información de sus hijos registrados
• Consultar esquema de vacunación
• Ver historial de vacunas aplicadas
• Recibir notificaciones de citas

Panel Principal:
• Mis Hijos: Lista de pacientes asociados
• Calendario de Vacunación: Esquema personalizado por hijo

DOCTOR:
Permisos:
• Gestionar pacientes del centro asignado
• Aplicar vacunas y registrar dosis
• Programar citas de vacunación
• Consultar inventario de vacunas
• Generar reportes básicos

Panel Principal:
• Gestión de Pacientes: CRUD completo
• Vacunación: Aplicar y programar vacunas
• Inventario: Consulta de lotes disponibles

DIRECTOR DE CENTRO:
Permisos:
• Gestionar personal médico del centro
• Administrar inventario de vacunas
• Generar reportes del centro
• Gestionar configuración del centro

ADMINISTRADOR DEL SISTEMA:
Permisos:
• Gestión completa de centros de salud
• Administración de usuarios
• Configuración del esquema nacional de vacunación
• Reportes globales del sistema`
        },
        {
          title: "4. Gestión de Pacientes",
          content: `REGISTRO DE NUEVO PACIENTE:
1. Navegue a "Gestión de Pacientes"
2. Haga clic en "Agregar Paciente"
3. Complete el formulario:

Información Básica (requerida):
• Nombre completo
• Fecha de nacimiento
• Género
• Identificación (opcional)

Información de Residencia (requerida):
• Dirección de residencia
• Nacionalidad (seleccionar de lista)
• País de nacimiento (seleccionar de lista)

Información del Sistema:
• Centro de salud (requerido)
• Contacto principal (teléfono)
• ID Salud Nacional (opcional)

4. Haga clic en "Guardar Paciente"

EDITAR INFORMACIÓN:
1. En la lista de pacientes, haga clic en el ícono de editar
2. Modifique los campos necesarios
3. Haga clic en "Guardar Cambios"

BUSCAR PACIENTES:
Use la barra de búsqueda para encontrar pacientes por:
• Nombre completo
• Número de identificación
• ID del paciente`
        },
        {
          title: "5. Centros de Vacunación",
          content: `CREAR NUEVO CENTRO (Solo Administradores):
1. Vaya a "Administración" → "Centros"
2. Haga clic en "Agregar Centro"
3. Complete la información:

Información Básica (requerida):
• Nombre del Centro
• Dirección

Información de Ubicación (requerida):
• Latitud
• Longitud

Información Adicional:
• Nombre Corto (abreviación)
• Teléfono
• Director
• Sitio Web

4. Haga clic en "Crear Centro"

IMPORTANTE: Las coordenadas de latitud y longitud son requeridas para mostrar el centro en el mapa.

GESTIONAR PERSONAL:
Los directores pueden asignar doctores a su centro:
1. En "Mi Centro", vaya a la pestaña "Personal"
2. Seleccione los doctores disponibles
3. Haga clic en "Asignar Doctores Seleccionados"`
        },
        {
          title: "6. Esquema de Vacunación",
          content: `CONSULTAR ESQUEMA PARA PACIENTE:
El sistema calcula automáticamente las vacunas recomendadas según la edad:

1. Seleccione un paciente en "Gestión de Pacientes"
2. La columna "Próxima Vacuna" muestra recomendaciones
3. Los chips de colores indican:
   - Verde: Vacuna recomendada para la edad actual
   - Azul: Próxima vacuna programada
   - Amarillo: Vacuna atrasada

APLICAR VACUNA:
1. Haga clic en "Vacunar" junto al paciente
2. Seleccione la vacuna del inventario disponible
3. Confirme la aplicación
4. El sistema registra automáticamente:
   - Fecha de aplicación
   - Doctor que aplicó
   - Lote utilizado
   - Centro donde se aplicó`
        },
        {
          title: "7. Consulta de Vacunas",
          content: `BUSCAR VACUNAS DISPONIBLES:
1. Vaya a "Consulta de Vacunas"
2. Use el buscador para filtrar por:
   - Nombre de vacuna
   - Fabricante
   - Descripción

CONSULTA POR PACIENTE:
1. Ingrese el ID del Paciente en el campo correspondiente
2. Haga clic en "Buscar Paciente"
3. El sistema mostrará:
   - Aplicada: Vacunas ya administradas
   - No disponible: Vacunas no adecuadas para la edad
   - Disponible: Vacunas que pueden aplicarse

ESTADOS DE VACUNAS:
• Aplicada: Ya fue administrada al paciente
• No disponible: El paciente no está en la edad adecuada
• Disponible: Puede ser aplicada al paciente
• Sin paciente: No hay paciente seleccionado`
        },
        {
          title: "8. Panel de Padres",
          content: `MIS HIJOS:
Los padres pueden consultar información de sus hijos:

1. En el panel principal, vaya a "Mis Hijos"
2. Verá tarjetas con información de cada hijo:
   - Datos personales
   - Edad actual en meses
   - Vacunas recomendadas para su edad
   - Próximas vacunas programadas

CALENDARIO DE VACUNACIÓN:
1. Haga clic en "Ver Calendario Completo" en la tarjeta del hijo
2. Se abrirá una tabla detallada con:
   - Todas las vacunas del esquema nacional
   - Edades recomendadas para cada vacuna
   - Estado actual de cada vacuna:
     * Recomendada: Para aplicar ahora
     * Próxima: Para aplicar más adelante
     * Atrasada: Debió aplicarse antes

RECOMENDACIONES:
• Consulte con su pediatra antes de aplicar vacunas
• Mantenga actualizado el carnet de vacunación
• Las fechas son aproximadas, el médico determina el momento exacto
• Reporte cualquier reacción adversa a las vacunas
• No falte a las citas programadas`
        },
        {
          title: "9. Solución de Problemas",
          content: `PROBLEMAS COMUNES:

No puedo iniciar sesión:
1. Verifique que su nombre de usuario y contraseña sean correctos
2. Asegúrese de que su cuenta esté activa
3. Contacte al administrador si persiste el problema

No veo mis pacientes (Padres):
1. Verifique que esté logueado con el rol "Padre"
2. Asegúrese de que sus hijos estén registrados con su ID de usuario
3. Contacte al centro de salud para verificar la asociación

Error al cargar el esquema de vacunación:
1. Verifique su conexión a internet
2. Refresque la página (F5)
3. Si persiste, contacte al soporte técnico

No puedo agregar pacientes (Doctores):
1. Verifique que esté asignado a un centro de salud
2. Asegúrese de tener los permisos necesarios
3. Complete todos los campos requeridos

CONTACTO DE SOPORTE:
Email: soporte@sistema-vacunacion.com
Teléfono: +1 (809) 123-4567
Horario: Lunes a Viernes, 8:00 AM - 6:00 PM`
        }
      ];
      
      // Agregar contenido
      content.forEach((section, index) => {
        if (index > 0) {
          doc.addPage();
          yPosition = margin;
        }
        
        addText(section.title, 16, true, [0, 102, 204]);
        yPosition += 5;
        addText(section.content, 11, false, [51, 51, 51]);
        yPosition += 10;
      });
      
      // Pie de página en todas las páginas
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Sistema de Vacunación Pediátrica - Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
      
      // Guardar el PDF
      doc.save('Manual_Usuario_Sistema_Vacunacion.pdf');
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Inténtelo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-center">Manual de Usuario</h2>
          <p className="text-center text-default-500">
            Sistema de Vacunación Pediátrica v2.1.0
          </p>
        </CardHeader>
        <CardBody className="flex flex-col items-center gap-6">
          <div className="text-center max-w-2xl">
            <p className="text-lg mb-4">
              Descargue el manual completo del usuario en formato PDF para tener acceso a toda la información 
              necesaria para usar el sistema de vacunación pediátrica.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 text-left">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  📋 Contenido Incluído:
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Guía de primeros pasos</li>
                  <li>• Roles y permisos de usuario</li>
                  <li>• Gestión de pacientes</li>
                  <li>• Esquemas de vacunación</li>
                  <li>• Solución de problemas</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  ✨ Características:
                </h3>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Formato PDF profesional</li>
                  <li>• Instrucciones paso a paso</li>
                  <li>• Capturas de pantalla</li>
                  <li>• Información actualizada</li>
                  <li>• Fácil navegación</li>
                </ul>
              </div>
            </div>
            
            <Button
              size="lg"
              color="primary"
              onClick={generatePDF}
              isLoading={isGenerating}
              disabled={isGenerating}
              className="font-semibold"
              startContent={!isGenerating && <span>📄</span>}
            >
              {isGenerating ? (
                <>
                  <Spinner size="sm" color="white" />
                  Generando PDF...
                </>
              ) : (
                'Descargar Manual de Usuario (PDF)'
              )}
            </Button>
            
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                💡 Consejos de Uso:
              </h4>
              <ul className="text-sm text-orange-700 dark:text-orange-300 text-left space-y-1">
                <li>• Guarde el PDF en un lugar accesible para referencia rápida</li>
                <li>• Comparta el manual con otros usuarios de su centro</li>
                <li>• Consulte la sección de solución de problemas ante dudas</li>
                <li>• El manual se actualiza con cada nueva versión del sistema</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ManualUsuario;

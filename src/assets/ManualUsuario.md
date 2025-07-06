# Manual de Usuario - Sistema de Vacunación Pediátrica

## Índice
1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Roles de Usuario](#roles-de-usuario)
4. [Gestión de Pacientes](#gestión-de-pacientes)
5. [Centros de Vacunación](#centros-de-vacunación)
6. [Esquema de Vacunación](#esquema-de-vacunación)
7. [Consulta de Vacunas](#consulta-de-vacunas)
8. [Panel de Padres](#panel-de-padres)
9. [Reportes y Estadísticas](#reportes-y-estadísticas)
10. [Solución de Problemas](#solución-de-problemas)

---

## Introducción

El Sistema de Vacunación Pediátrica es una plataforma integral diseñada para gestionar y seguir el esquema de vacunación de niños. El sistema permite:

- **Registro y seguimiento de pacientes**
- **Gestión de esquemas de vacunación**
- **Control de inventarios de vacunas**
- **Programación de citas**
- **Generación de reportes**
- **Acceso para padres de familia**

### Características Principales

✅ **Interfaz moderna y responsiva**  
✅ **Múltiples roles de usuario (Admin, Director, Doctor, Padre)**  
✅ **Esquema de vacunación automatizado**  
✅ **Alertas y recordatorios**  
✅ **Historial completo de vacunación**  
✅ **Reportes estadísticos**  

---

## Primeros Pasos

### 1. Acceso al Sistema

1. Abra su navegador web e ingrese a la URL del sistema
2. Verá la pantalla de inicio de sesión
3. Si no tiene cuenta, haga clic en "Registrarse"

### 2. Registro de Usuario

Para registrarse como nuevo usuario:

1. Haga clic en "Registrarse"
2. Complete el formulario con:
   - **Nombre completo**
   - **Nombre de usuario** (único)
   - **Correo electrónico**
   - **Contraseña** (mínimo 6 caracteres)
   - **Rol** (Padre, Doctor, Director, Admin)
   - **Centro de salud** (si aplica)

3. Haga clic en "Registrarse"
4. El sistema lo redirigirá al panel principal

### 3. Inicio de Sesión

Si ya tiene cuenta:

1. Ingrese su **nombre de usuario**
2. Ingrese su **contraseña**
3. Haga clic en "Iniciar Sesión"

---

## Roles de Usuario

### 👨‍👩‍👧‍👦 Padre de Familia
**Permisos:**
- Ver información de sus hijos registrados
- Consultar esquema de vacunación
- Ver historial de vacunas aplicadas
- Recibir notificaciones de citas

**Panel Principal:**
- **Mis Hijos:** Lista de pacientes asociados
- **Calendario de Vacunación:** Esquema personalizado por hijo

### 👩‍⚕️ Doctor
**Permisos:**
- Gestionar pacientes del centro asignado
- Aplicar vacunas y registrar dosis
- Programar citas de vacunación
- Consultar inventario de vacunas
- Generar reportes básicos

**Panel Principal:**
- **Gestión de Pacientes:** CRUD completo
- **Vacunación:** Aplicar y programar vacunas
- **Inventario:** Consulta de lotes disponibles

### 🏥 Director de Centro
**Permisos:**
- Gestionar personal médico del centro
- Administrar inventario de vacunas
- Generar reportes del centro
- Gestionar configuración del centro

**Panel Principal:**
- **Mi Centro:** Información y configuración
- **Personal Médico:** Asignación de doctores
- **Inventario:** Gestión de lotes y existencias
- **Reportes:** Estadísticas del centro

### ⚙️ Administrador del Sistema
**Permisos:**
- Gestión completa de centros de salud
- Administración de usuarios
- Configuración del esquema nacional de vacunación
- Reportes globales del sistema

**Panel Principal:**
- **Administración:** Configuración global
- **Centros:** CRUD de centros de salud
- **Usuarios:** Gestión de cuentas
- **Esquema Nacional:** Configuración de vacunas

---

## Gestión de Pacientes

### Registro de Nuevo Paciente

1. Navegue a **"Gestión de Pacientes"**
2. Haga clic en **"Agregar Paciente"**
3. Complete el formulario:

#### Información Básica
- **Nombre completo** ⭐ (requerido)
- **Fecha de nacimiento** ⭐ (requerido)
- **Género** ⭐ (requerido)
- **Identificación** (opcional)

#### Información de Residencia
- **Dirección de residencia** ⭐ (requerido)
- **Nacionalidad** ⭐ (seleccionar de lista)
- **País de nacimiento** ⭐ (seleccionar de lista)

#### Información del Sistema
- **Centro de salud** ⭐ (requerido)
- **Contacto principal** (teléfono)
- **ID Salud Nacional** (opcional)

4. Haga clic en **"Guardar Paciente"**

> **💡 Nota:** Los campos marcados con ⭐ son obligatorios

### Editar Información del Paciente

1. En la lista de pacientes, haga clic en el ícono de **editar** (✏️)
2. Modifique los campos necesarios
3. Haga clic en **"Guardar Cambios"**

### Buscar Pacientes

Utilice la barra de búsqueda para encontrar pacientes por:
- Nombre completo
- Número de identificación
- ID del paciente

---

## Centros de Vacunación

### Crear Nuevo Centro (Solo Administradores)

1. Vaya a **"Administración"** → **"Centros"**
2. Haga clic en **"Agregar Centro"**
3. Complete la información:

#### Información Básica ⭐
- **Nombre del Centro** (requerido)
- **Dirección** (requerida)

#### Información de Ubicación ⭐
- **Latitud** (requerida)
- **Longitud** (requerida)

#### Información Adicional
- **Nombre Corto** (abreviación)
- **Teléfono**
- **Director**
- **Sitio Web**

4. Haga clic en **"Crear Centro"**

> **⚠️ Importante:** Las coordenadas de latitud y longitud son requeridas para mostrar el centro en el mapa

### Gestionar Personal del Centro

Los directores pueden asignar doctores a su centro:

1. En **"Mi Centro"**, vaya a la pestaña **"Personal"**
2. Seleccione los doctores disponibles
3. Haga clic en **"Asignar Doctores Seleccionados"**

---

## Esquema de Vacunación

### Consultar Esquema para un Paciente

El sistema calcula automáticamente las vacunas recomendadas según la edad:

1. Seleccione un paciente en **"Gestión de Pacientes"**
2. La columna **"Próxima Vacuna"** muestra recomendaciones
3. Los chips de colores indican:
   - 🟢 **Verde:** Vacuna recomendada para la edad actual
   - 🔵 **Azul:** Próxima vacuna programada
   - 🟡 **Amarillo:** Vacuna atrasada

### Aplicar Vacuna

1. Haga clic en **"Vacunar"** junto al paciente
2. Seleccione la vacuna del inventario disponible
3. Confirme la aplicación
4. El sistema registra automáticamente:
   - Fecha de aplicación
   - Doctor que aplicó
   - Lote utilizado
   - Centro donde se aplicó

---

## Consulta de Vacunas

### Buscar Vacunas Disponibles

1. Vaya a **"Consulta de Vacunas"**
2. Use el buscador para filtrar por:
   - Nombre de vacuna
   - Fabricante
   - Descripción

### Consulta por Paciente

1. Ingrese el **ID del Paciente** en el campo correspondiente
2. Haga clic en **"Buscar Paciente"**
3. El sistema mostrará:
   - ✅ **Aplicada:** Vacunas ya administradas
   - 🚫 **No disponible:** Vacunas no adecuadas para la edad
   - ✅ **Disponible:** Vacunas que pueden aplicarse

### Estados de Vacunas

- **🟢 Aplicada:** Ya fue administrada al paciente
- **🔴 No disponible:** El paciente no está en la edad adecuada
- **🔵 Disponible:** Puede ser aplicada al paciente
- **⚪ Sin paciente:** No hay paciente seleccionado

---

## Panel de Padres

### Mis Hijos

Los padres pueden consultar información de sus hijos:

1. En el panel principal, vaya a **"Mis Hijos"**
2. Verá tarjetas con información de cada hijo:
   - Datos personales
   - Edad actual en meses
   - Vacunas recomendadas para su edad
   - Próximas vacunas programadas

### Calendario de Vacunación

1. Haga clic en **"Ver Calendario Completo"** en la tarjeta del hijo
2. Se abrirá una tabla detallada con:
   - Todas las vacunas del esquema nacional
   - Edades recomendadas para cada vacuna
   - Estado actual de cada vacuna:
     - **🟢 Recomendada:** Para aplicar ahora
     - **🔵 Próxima:** Para aplicar más adelante
     - **🟡 Atrasada:** Debió aplicarse antes

### Recomendaciones para Padres

📋 **Lista de verificación:**
- ✅ Consulte con su pediatra antes de aplicar vacunas
- ✅ Mantenga actualizado el carnet de vacunación
- ✅ Las fechas son aproximadas, el médico determina el momento exacto
- ✅ Reporte cualquier reacción adversa a las vacunas
- ✅ No falte a las citas programadas

---

## Reportes y Estadísticas

### Reportes para Doctores

- **Pacientes Atendidos:** Lista de pacientes del mes
- **Vacunas Aplicadas:** Registro de vacunaciones realizadas
- **Inventario:** Estado actual de lotes disponibles

### Reportes para Directores

- **Estadísticas del Centro:** Resumen mensual de actividades
- **Personal:** Productividad del equipo médico
- **Inventario:** Control de existencias y vencimientos

### Reportes para Administradores

- **Cobertura Nacional:** Porcentaje de vacunación por región
- **Centros Activos:** Estado de todos los centros
- **Usuarios del Sistema:** Estadísticas de uso

---

## Solución de Problemas

### Problemas Comunes

#### No puedo iniciar sesión
1. Verifique que su nombre de usuario y contraseña sean correctos
2. Asegúrese de que su cuenta esté activa
3. Contacte al administrador si persiste el problema

#### No veo mis pacientes (Padres)
1. Verifique que esté logueado con el rol "Padre"
2. Asegúrese de que sus hijos estén registrados con su ID de usuario
3. Contacte al centro de salud para verificar la asociación

#### Error al cargar el esquema de vacunación
1. Verifique su conexión a internet
2. Refresque la página (F5)
3. Si persiste, contacte al soporte técnico

#### No puedo agregar pacientes (Doctores)
1. Verifique que esté asignado a un centro de salud
2. Asegúrese de tener los permisos necesarios
3. Complete todos los campos requeridos marcados con ⭐

### Mensajes de Error Frecuentes

| Error | Causa | Solución |
|-------|-------|----------|
| "Usuario no autorizado" | Sesión expirada | Cierre sesión e inicie nuevamente |
| "Centro no encontrado" | Centro desactivado | Contacte al administrador |
| "Paciente ya existe" | ID duplicado | Verifique el número de identificación |
| "Vacuna no disponible" | Sin stock | Verifique el inventario del centro |

### Contacto de Soporte

📧 **Email:** soporte@sistema-vacunacion.com  
📞 **Teléfono:** +1 (809) 123-4567  
🕒 **Horario:** Lunes a Viernes, 8:00 AM - 6:00 PM  

### Información del Sistema

- **Versión:** 2.1.0
- **Última actualización:** Diciembre 2024
- **Navegadores compatibles:** Chrome, Firefox, Safari, Edge
- **Dispositivos:** Desktop, Tablet, Móvil

---

## Términos y Condiciones

### Uso del Sistema
- El acceso está restringido a personal autorizado
- Cada usuario es responsable de mantener la confidencialidad de sus credenciales
- El uso indebido del sistema será reportado a las autoridades competentes

### Privacidad de Datos
- Toda la información de pacientes está protegida según las leyes de privacidad
- No comparta credenciales de acceso con terceros
- Reporte inmediatamente cualquier uso no autorizado

### Actualizaciones
- El sistema se actualiza automáticamente
- Las nuevas funcionalidades se notifican en el panel principal
- Mantenga su navegador actualizado para mejor rendimiento

---

**© 2024 Sistema de Vacunación Pediátrica. Todos los derechos reservados.**

---

*Este manual está sujeto a actualizaciones. La versión más reciente está disponible en el sistema.*

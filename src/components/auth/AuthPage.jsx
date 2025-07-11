// src/components/auth/AuthPage.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Divider,
  Link,
  Checkbox,
} from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon } from "./Icons";
import authService from "../../services/authService";
import tutorsService from "../../services/tutorsService";
import usuariosService from "../../services/usuariosService";

const AuthPage = ({ isOpen = true, onClose, onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [loginType, setLoginType] = useState("staff"); // 'staff' o 'padre'
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    email: "",
    identificacion: "",
    telefono: "",
    direccion: "",
    nacionalidad: "Dominicano",
    relacion: "Madre",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Removed duplicate togglePasswordVisibility declaration

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("publicDarkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("publicDarkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && !acceptTerms) {
      setError("Debes aceptar los términos y condiciones para registrarte");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Clear token before login to avoid sending stale token
        localStorage.removeItem("authToken");

        let user;
        if (loginType === "padre") {
          // Login para padres usando nombre y cédula
          const result = await authService.loginPadre(
            formData.nombre,
            formData.identificacion
          );
          if (result.success) {
            user = result.user;
            console.log("[AuthPage] ✅ Login de padre exitoso:", user);
          } else {
            setError(
              result.error || "No se encontró un padre/tutor con esos datos"
            );
            return;
          }
        } else {
          // Login tradicional para personal del centro
          user = await usuariosService.validateLogin(
            formData.username,
            formData.password
          );
          if (!user) {
            setError("Usuario o contraseña incorrectos");
            return;
          }
        }

        if (user) {
          // Guarda el usuario autenticado para persistencia tras recarga
          localStorage.setItem("currentUser", JSON.stringify(user));

          // Intentar obtener y guardar vacunas, lotes y usuarios si tienes permisos
          try {
            const vacunas = await usuariosService.getVacunas?.();
            if (vacunas)
              localStorage.setItem("vacunas", JSON.stringify(vacunas));
          } catch (e) {
            console.warn("No se pudieron guardar vacunas en localStorage");
          }

          try {
            const lotes = await usuariosService.getLotesVacunas?.();
            if (lotes)
              localStorage.setItem("lotesVacunas", JSON.stringify(lotes));
          } catch (e) {
            console.warn("No se pudieron guardar lotes en localStorage");
          }

          try {
            const usuarios = await usuariosService.getUsuarios?.();
            if (usuarios)
              localStorage.setItem("usuarios", JSON.stringify(usuarios));
          } catch (e) {
            console.warn("No se pudieron guardar usuarios en localStorage");
          }

          if (typeof onLogin === "function") {
            onLogin(user);
          } else {
            console.error("onLogin is not a function");
          }
        }
      } else {
        // Validaciones para registro de padre/tutor
        if (!formData.username?.trim()) {
          setError("El nombre de usuario es requerido");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Las contraseñas no coinciden");
          return;
        }
        if (formData.password.length < 6) {
          setError("La contraseña debe tener al menos 6 caracteres");
          return;
        }
        if (!formData.nombre?.trim()) {
          setError("El nombre completo es requerido");
          return;
        }
        if (!formData.identificacion?.trim()) {
          setError("La identificación es requerida");
          return;
        }
        if (!formData.email?.trim()) {
          setError("El email es requerido");
          return;
        }
        if (!formData.telefono?.trim()) {
          setError("El teléfono es requerido");
          return;
        }
        if (!formData.direccion?.trim()) {
          setError("La dirección es requerida");
          return;
        }
        if (!formData.nacionalidad?.trim()) {
          setError("La nacionalidad es requerida");
          return;
        }
        if (!formData.relacion?.trim()) {
          setError("La relación con el niño es requerida");
          return;
        }

        console.log("[AuthPage] === INICIANDO REGISTRO DE PADRE ===");
        console.log(
          "[AuthPage] FormData completo antes de procesar:",
          formData
        );
        console.log("[AuthPage] === VERIFICANDO CAMPOS CRÍTICOS ===");
        console.log("[AuthPage] username:", formData.username);
        console.log(
          "[AuthPage] password:",
          formData.password ? "***PRESENTE***" : "***AUSENTE***"
        );
        console.log("[AuthPage] nombre:", formData.nombre);
        console.log("[AuthPage] identificacion:", formData.identificacion);

        // Generar UUID para id_niño
        const generateUUID = () => {
          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            }
          );
        };

        // Crear el tutor con el formato requerido (incluye username y password)
        const tutorData = {
          id_niño: generateUUID(),
          nombre: formData.nombre,
          relacion: formData.relacion,
          nacionalidad: formData.nacionalidad,
          identificacion: formData.identificacion,
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
          username: formData.username,
          password: formData.password,
        };

        console.log("[AuthPage] === DATOS DEL TUTOR A ENVIAR AL BACKEND ===");
        console.log(JSON.stringify(tutorData, null, 2));
        console.log(
          "[AuthPage] === VERIFICACIÓN FINAL DE USERNAME Y PASSWORD ==="
        );
        console.log("[AuthPage] tutorData.username:", tutorData.username);
        console.log(
          "[AuthPage] tutorData.password:",
          tutorData.password ? "***PRESENTE***" : "***AUSENTE***"
        );
        console.log("[AuthPage] === VERIFICANDO CADA CAMPO ===");
        console.log("✓ id_niño:", tutorData.id_niño, "(debe ser UUID)");
        console.log("✓ nombre:", tutorData.nombre);
        console.log("✓ relacion:", tutorData.relacion);
        console.log("✓ nacionalidad:", tutorData.nacionalidad);
        console.log("✓ identificacion:", tutorData.identificacion);
        console.log("✓ telefono:", tutorData.telefono);
        console.log("✓ email:", tutorData.email);
        console.log("✓ direccion:", tutorData.direccion);
        console.log("✓ username:", tutorData.username);
        console.log("✓ password:", tutorData.password ? "***" : "NO_PASSWORD");
        console.log("[AuthPage] === CONFIRMANDO ESTRUCTURA EXACTA ===");
        console.log("Campo id_niño está presente:", "id_niño" in tutorData);
        console.log(
          "Valor de id_niño es UUID:",
          tutorData.id_niño && tutorData.id_niño.length === 36
        );
        console.log("Campo username está presente:", "username" in tutorData);
        console.log("Campo password está presente:", "password" in tutorData);
        console.log("[AuthPage] === FIN VERIFICACIÓN ===");

        console.log("[AuthPage] Llamando a tutorsService.createTutor...");
        const tutorResponse = await tutorsService.createTutor(tutorData);
        console.log("[AuthPage] ✅ Tutor creado exitosamente:", tutorResponse);

        console.log("[AuthPage] === FINALIZANDO REGISTRO ===");
        // Registro exitoso, mostrar mensaje de éxito
        setError("");
        alert(
          "¡Registro exitoso! Tu perfil de padre ha sido creado correctamente con credenciales de acceso. Ahora puedes iniciar sesión."
        );
        setIsLogin(true); // Cambiar a modo login
        // Limpiar el formulario
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          nombre: "",
          email: "",
          identificacion: "",
          telefono: "",
          direccion: "",
          nacionalidad: "Dominicano",
          relacion: "Madre",
        });
      }
    } catch (err) {
      // More user-friendly error messages
      let errorMessage =
        err.message || "Error en el servidor. Intenta nuevamente.";

      if (errorMessage.includes("Error en la solicitud al servidor")) {
        errorMessage =
          "Hay un problema temporal con el servidor de autenticación. " +
          "El sistema está intentando métodos alternativos de verificación. " +
          "Si el problema persiste, contacte al administrador.";
      } else if (errorMessage.includes("Invalid credentials")) {
        errorMessage =
          "Usuario o contraseña incorrectos. Verifique sus credenciales.";
      } else if (errorMessage.includes("User account is inactive")) {
        errorMessage = "Su cuenta está inactiva. Contacte al administrador.";
      }

      setError(errorMessage);
      console.error("Error de autenticación:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`[AuthPage] handleChange: ${name} = "${value}"`);
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
  };

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const handleTabChange = (key) => {
    setIsLogin(key === "login");
    setError("");
    setLoginType("staff"); // Reset to staff login when changing tabs
    if (key === "login") {
      setFormData({
        ...formData,
        username: "",
        password: "",
        nombre: "",
        identificacion: "",
      });
    } else {
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        nombre: "",
        email: "",
        identificacion: "",
        telefono: "",
        direccion: "",
        nacionalidad: "Dominicano",
        relacion: "Madre",
      });
      setAcceptTerms(false);
    }
  };

  // Handler for demo login
  const handleDemoLogin = (demoUser) => {
    if (typeof onLogin === "function") {
      onLogin(demoUser);
    } else {
      console.error("onLogin is not a function");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Button
            onClick={onBack}
            variant="light"
            startContent={<span>←</span>}
            className="absolute left-0 top-0"
            title="Volver a la página principal"
          >
            Volver
          </Button>
          <Button
            onClick={() => setDarkMode(!darkMode)}
            isIconOnly
            variant="light"
            className="absolute right-0 top-0"
            title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {darkMode ? "☀️" : "🌙"}
          </Button>
          <h1 className="text-4xl font-bold mb-2">Sistema de Vacunación</h1>
          <p className="text-lg text-default-500">
            Gestión integral de centros de vacunación y pacientes
          </p>
        </div>
        <div className="auth-content">
          <Card className="auth-card w-full max-w-md">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <Tabs
                fullWidth
                size="lg"
                aria-label="Opciones de autenticación"
                selectedKey={isLogin ? "login" : "register"}
                onSelectionChange={handleTabChange}
              >
                <Tab key="login" title="Iniciar Sesión" />
                <Tab key="register" title="Registro de Padre" />
              </Tabs>
            </CardHeader>

            <CardBody className="py-5 px-6">
              {error && (
                <div className="bg-danger-50 border-l-4 border-danger text-danger p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isLogin ? (
                  <>
                    {/* Selector de tipo de login */}
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <Button
                          color={loginType === "staff" ? "primary" : "default"}
                          variant={loginType === "staff" ? "solid" : "bordered"}
                          size="sm"
                          onClick={() => {
                            setLoginType("staff");
                            setFormData({
                              ...formData,
                              username: "",
                              password: "",
                              nombre: "",
                              identificacion: "",
                            });
                            setError("");
                          }}
                          className="flex-1"
                        >
                          👩‍⚕️ Personal del Centro
                        </Button>
                        <Button
                          color={loginType === "padre" ? "primary" : "default"}
                          variant={loginType === "padre" ? "solid" : "bordered"}
                          size="sm"
                          onClick={() => {
                            setLoginType("padre");
                            setFormData({
                              ...formData,
                              username: "",
                              password: "",
                              nombre: "",
                              identificacion: "",
                            });
                            setError("");
                          }}
                          className="flex-1"
                        >
                          👨‍👩‍👧‍👦 Padre/Tutor
                        </Button>
                      </div>
                    </div>

                    {loginType === "staff" ? (
                      // Login tradicional para personal
                      <>
                        <Input
                          label="Usuario"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Ingresa tu nombre de usuario"
                          variant="bordered"
                          fullWidth
                          required
                          startContent={
                            <span className="text-default-400">👤</span>
                          }
                        />

                        <Input
                          label="Contraseña"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Ingresa tu contraseña"
                          type={isPasswordVisible ? "text" : "password"}
                          variant="bordered"
                          fullWidth
                          required
                          startContent={
                            <span className="text-default-400">🔒</span>
                          }
                          endContent={
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="focus:outline-none"
                            >
                              {isPasswordVisible ? (
                                <EyeSlashIcon className="text-default-400 w-5 h-5" />
                              ) : (
                                <EyeIcon className="text-default-400 w-5 h-5" />
                              )}
                            </button>
                          }
                        />

                        <div className="flex justify-between items-center">
                          <Checkbox size="sm">Recordarme</Checkbox>
                          <Link href="#" size="sm">
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </div>
                      </>
                    ) : (
                      // Login para padres/tutores
                      <>
                        <div className="bg-blue-50 p-3 rounded-lg mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">👨‍👩‍👧‍👦</span>
                            <h4 className="text-md font-semibold">
                              Acceso para Padres/Tutores
                            </h4>
                          </div>
                          <p className="text-sm text-default-500">
                            Ingresa tu nombre completo y cédula para acceder
                          </p>
                        </div>

                        <Input
                          label="Nombre Completo"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          placeholder="Tu nombre completo como aparece registrado"
                          variant="bordered"
                          fullWidth
                          required
                          startContent={
                            <span className="text-default-400">👤</span>
                          }
                        />

                        <Input
                          label="Cédula de Identidad"
                          name="identificacion"
                          value={formData.identificacion}
                          onChange={handleChange}
                          placeholder="000-0000000-0"
                          variant="bordered"
                          fullWidth
                          required
                          startContent={
                            <span className="text-default-400">🆔</span>
                          }
                        />

                        <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-800">
                          <strong>💡 Nota:</strong> Debes estar registrado como
                          tutor en el sistema para poder acceder.
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* Campos de usuario y contraseña */}
                    <Input
                      label="Usuario"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Nombre de usuario único"
                      variant="bordered"
                      fullWidth
                      required
                      startContent={
                        <span className="text-default-400">👤</span>
                      }
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Contraseña"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        type={isPasswordVisible ? "text" : "password"}
                        variant="bordered"
                        fullWidth
                        required
                        endContent={
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="focus:outline-none"
                          >
                            {isPasswordVisible ? (
                              <EyeSlashIcon className="text-default-400 w-5 h-5" />
                            ) : (
                              <EyeIcon className="text-default-400 w-5 h-5" />
                            )}
                          </button>
                        }
                      />
                      <Input
                        label="Confirmar Contraseña"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repite tu contraseña"
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        variant="bordered"
                        fullWidth
                        required
                        endContent={
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="focus:outline-none"
                          >
                            {isConfirmPasswordVisible ? (
                              <EyeSlashIcon className="text-default-400 w-5 h-5" />
                            ) : (
                              <EyeIcon className="text-default-400 w-5 h-5" />
                            )}
                          </button>
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nombre Completo"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Tu nombre completo"
                        variant="bordered"
                        fullWidth
                        required
                      />
                      <Input
                        label="Identificación"
                        name="identificacion"
                        value={formData.identificacion}
                        onChange={handleChange}
                        placeholder="000-0000000-0"
                        variant="bordered"
                        fullWidth
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        type="email"
                        variant="bordered"
                        fullWidth
                        required
                      />
                      <Input
                        label="Teléfono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="(809) 000-0000"
                        variant="bordered"
                        fullWidth
                        required
                      />
                    </div>

                    {/* Campos adicionales para padres/tutores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Dirección"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        placeholder="Tu dirección completa"
                        variant="bordered"
                        fullWidth
                        required
                      />
                      <Input
                        label="Nacionalidad"
                        name="nacionalidad"
                        value={formData.nacionalidad}
                        onChange={handleChange}
                        placeholder="Dominicano"
                        variant="bordered"
                        fullWidth
                        required
                      />
                    </div>

                    <Select
                      label="Relación con el niño"
                      name="relacion"
                      selectedKeys={[formData.relacion]}
                      onSelectionChange={(keys) => {
                        const selectedValue = Array.from(keys)[0] || "Madre";
                        handleChange({
                          target: { name: "relacion", value: selectedValue },
                        });
                      }}
                      variant="bordered"
                      fullWidth
                      required
                    >
                      <SelectItem key="Madre" value="Madre">
                        Madre
                      </SelectItem>
                      <SelectItem key="Padre" value="Padre">
                        Padre
                      </SelectItem>
                      <SelectItem key="Tutor Legal" value="Tutor Legal">
                        Tutor Legal
                      </SelectItem>
                    </Select>

                    {/* Información para padres */}
                    <div className="bg-default-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">👨‍👩‍👧‍👦</span>
                        <h4 className="text-md font-semibold">
                          Registro de Padre/Tutor
                        </h4>
                      </div>
                      <p className="text-sm text-default-500">
                        Crea tu perfil de padre/tutor con credenciales de acceso
                        al sistema
                      </p>
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                        <strong>📝 Nota:</strong> Al registrarte se creará tu
                        perfil completo de tutor que incluye:
                        <ul className="mt-1 ml-2">
                          <li>
                            • Credenciales de acceso (usuario y contraseña)
                          </li>
                          <li>• Información personal y de contacto</li>
                          <li>
                            • Capacidad para gestionar citas de vacunación
                          </li>
                        </ul>
                      </div>
                    </div>

                    <Checkbox
                      isSelected={acceptTerms}
                      onValueChange={setAcceptTerms}
                      size="sm"
                    >
                      Acepto los{" "}
                      <Link href="#" size="sm">
                        términos y condiciones
                      </Link>{" "}
                      y la{" "}
                      <Link href="#" size="sm">
                        política de privacidad
                      </Link>
                    </Checkbox>

                    {/* COMENTADO: Debug info para desarrollo - Deshabilitado */}
                    {false && process.env.NODE_ENV === "development" && (
                      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-small">
                        <div>
                          <strong>Debug Info - FormData:</strong>
                        </div>
                        <div className="text-xs space-y-1 mt-2">
                          <div>username: "{formData.username}"</div>
                          <div>
                            password: "{formData.password ? "***" : ""}"
                          </div>
                          <div>nombre: "{formData.nombre}"</div>
                          <div>identificacion: "{formData.identificacion}"</div>
                          <div>email: "{formData.email}"</div>
                          <div>telefono: "{formData.telefono}"</div>

                          <div>direccion: "{formData.direccion}"</div>
                          <div>nacionalidad: "{formData.nacionalidad}"</div>
                          <div>relacion: "{formData.relacion}"</div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <Divider className="my-4" />

                <Button
                  type="submit"
                  color="primary"
                  fullWidth
                  isLoading={loading}
                  isDisabled={!isLogin && !acceptTerms}
                  className="font-semibold"
                  size="lg"
                >
                  {loading
                    ? "Procesando..."
                    : isLogin
                    ? loginType === "padre"
                      ? "Acceder como Padre"
                      : "Iniciar Sesión"
                    : "Registrar Padre"}
                </Button>

                {/* COMENTADO: Usuarios de Acceso Rápido - Usuarios Demo */}
                {/* {isLogin && (
                  <div className="mt-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold mb-3 text-blue-800">🚀 Acceso Rápido - Usuarios Demo</h4>
                    
                    {loginType === 'staff' && (
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                          <div>
                            <span className="font-medium">👨‍💼 Administrador</span>
                            <p className="text-gray-500 text-xs">Acceso completo al sistema</p>
                          </div>
                          <Button 
                            size="sm" 
                            color="primary"
                            variant="flat" 
                            className="h-7 px-3"
                            onClick={async () => {
                              const result = await authService.demoLogin({
                                id: 'demo-admin',
                                username: 'admin',
                                name: 'Administrador Demo',
                                role: 'administrador'
                              });
                              if (result.success) handleDemoLogin(result.user);
                            }}
                          >
                            Ingresar
                          </Button>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                          <div>
                            <span className="font-medium">🏥 Director</span>
                            <p className="text-gray-500 text-xs">Gestión de centro</p>
                          </div>
                          <Button 
                            size="sm" 
                            color="secondary"
                            variant="flat" 
                            className="h-7 px-3"
                            onClick={async () => {
                              const result = await authService.demoLogin({
                                id: 'demo-director',
                                username: 'director',
                                name: 'Director Demo',
                                role: 'director'
                              });
                              if (result.success) handleDemoLogin(result.user);
                            }}
                          >
                            Ingresar
                          </Button>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                          <div>
                            <span className="font-medium">👩‍⚕️ Enfermero</span>
                            <p className="text-gray-500 text-xs">Aplicación de vacunas</p>
                          </div>
                          <Button 
                            size="sm" 
                            color="success"
                            variant="flat" 
                            className="h-7 px-3"
                            onClick={async () => {
                              const result = await authService.demoLogin({
                                id: 'demo-enfermero',
                                username: 'enfermero',
                                name: 'Enfermero Demo',
                                role: 'enfermero'
                              });
                              if (result.success) handleDemoLogin(result.user);
                            }}
                          >
                            Ingresar
                          </Button>
                        </div>
                      </div>
                    )}

                    {loginType === 'padre' && (
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                          <div>
                            <span className="font-medium">👨‍👩‍👧‍👦 María González</span>
                            <p className="text-gray-500 text-xs">Cédula: 001-1234567-8</p>
                          </div>
                          <Button 
                            size="sm" 
                            color="warning"
                            variant="flat" 
                            className="h-7 px-3"
                            onClick={() => {
                   setFormData({ 
                                ...formData, 
                                nombre: 'María González', 
                                identificacion: '001-1234567-8' 
                              });
                            }}
                          >
                            Llenar
                          </Button>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                          <div>
                            <span className="font-medium">👨‍👩‍👧‍👦 Pedro Martínez</span>
                            <p className="text-gray-500 text-xs">Cédula: 001-9876543-2</p>
                          </div>
                          <Button 
                            size="sm" 
                            color="warning"
                            variant="flat" 
                            className="h-7 px-3"
                            onClick={() => {
                              setFormData({ 
                                ...formData, 
                                           nombre: 'Pedro Martínez', 
                                identificacion: '001-9876543-2' 
                              });
                            }}
                          >
                            Llenar
                          </Button>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                          <strong>💡 Nota:</strong> Estos son tutores de ejemplo. Puedes usar sus datos para probar el sistema.
                        </div>
                      </div>
                    )}

                    <div className="mt-3 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                      <strong>💡 Acceso sin servidor:</strong> Estos usuarios funcionan aunque el servidor tenga problemas.
                    </div>
                    
                    {loginType === 'staff' && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <h5 className="text-xs font-semibold mb-2 text-blue-700">🔧 Login tradicional (requiere servidor funcionando):</h5>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="bordered" 
                            className="h-6 px-2 text-xs"
                            onClick={() => setFormData({...formData, username: 'admin', password: 'admin123'})}
                          >
                            Admin
                          </Button>
                          <Button 
                            size="sm" 
                            variant="bordered" 
                            className="h-6 px-2 text-xs"
                            onClick={() => setFormData({...formData, username: 'testuser', password: 'test123'})}
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )} */}

                {isLogin && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-default-500">
                      ¿No tienes una cuenta?
                      <Button
                        variant="light"
                        className="ml-1 p-0"
                        onClick={() => handleTabChange("register")}
                      >
                        Regístrate aquí
                      </Button>
                    </p>
                  </div>
                )}
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

# Proyecto Final MiniOS

Aplicación web desarrollada como proyecto final para simular el funcionamiento básico de un sistema operativo. Permite visualizar y administrar procesos, ejecutar algoritmos de planificación y monitorear recursos del sistema.

El proyecto está dividido en un cliente frontend y un servidor backend.

## Tecnologías

- **Cliente:** React, TypeScript, Vite y Tailwind CSS
- **Servidor:** Node.js y JavaScript

## Autores

- [@KevinhoProgra](https://github.com/KevinhoProgra)
- [@KaelCarranza](https://github.com/KaelCarranza)
- [@keymoa22](https://github.com/keymoa22)

## Requisitos

- Node.js instalado

## Instalación

Instala las dependencias del cliente:

```bash
cd client
npm install
```

El servidor no utiliza dependencias externas.

## Ejecución local

Abre dos terminales desde la carpeta raíz del proyecto.

En la primera, inicia el backend:

```bash
cd server
npm start
```

En la segunda, inicia el frontend:

```bash
cd client
npm run dev
```

El cliente estará disponible en `http://localhost:5173` y se conectará al servidor en `http://127.0.0.1:3000`.

Para crear una compilación de producción del cliente:

```bash
cd client
npm run build
```

## Estructura del proyecto

```text
ProyectoFinal/
├── client/              # Aplicación React
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── server/              # API y simulador del sistema
│   ├── logs/            # Reportes de sesión generados
│   ├── server.js
│   └── package.json
├── shared/              # Reservado para tipos o utilidades compartidas
├── .gitignore
└── README.md
```

## API

Todas las rutas utilizan el servidor `http://127.0.0.1:3000`.

### Consultar el estado del sistema

```http
GET /api/state
```

Devuelve los procesos, las estadísticas de CPU/RAM/disco, la configuración del planificador y el catálogo de aplicaciones.

### Consultar aplicaciones disponibles

```http
GET /api/apps
```

Devuelve el catálogo de aplicaciones que se pueden abrir.

### Abrir una aplicación

```http
POST /api/apps/open
```

Body JSON:

```json
{
  "appId": "chrome"
}
```

Aplicaciones disponibles: `word`, `chrome`, `spotify`, `explorer`, `calculator`, `terminal`, `vscode`, `paint`, `settings`, `editor`, `mail`, `game`, `photos` y `database`.

### Actualizar un proceso

```http
POST /api/processes
```

Body JSON:

```json
{
  "pid": 1,
  "action": "terminate"
}
```

`action` puede ser `terminate` para finalizar el proceso o `cleanup` para eliminar un proceso ya terminado.

### Iniciar o pausar la simulación

```http
POST /api/simulation/toggle
```

Body JSON opcional:

```json
{
  "isRunning": true
}
```

Si se omite el cuerpo, se invierte el estado actual.

### Ejecutar un paso

```http
POST /api/simulation/step
```

Ejecuta manualmente un ciclo del planificador. No requiere parámetros.

### Reiniciar la simulación

```http
POST /api/simulation/reset
```

Reinicia la simulación a sus valores predeterminados y guarda un reporte de la sesión anterior.

### Cambiar la configuración del planificador

```http
POST /api/simulation/config
```

Body JSON:

```json
{
  "algorithm": "Round Robin",
  "quantum": 3
}
```

Los algoritmos disponibles son `Round Robin`, `SJF` y `Prioridades`. El quantum debe ser un número mínimo de `1`; la interfaz limita su valor máximo a `10`.

### Consultar y descargar reportes

```http
GET /api/reports
GET /api/reports/:fileName
```

La primera ruta devuelve la lista de reportes guardados y la segunda descarga un reporte específico.

## Funcionalidades

- Simulación en tiempo real de un planificador de procesos
- Algoritmos Round Robin, SJF y Prioridades
- Configuración del quantum de Round Robin
- Monitoreo de CPU, RAM y disco
- Gestión de memoria RAM y swap
- Tabla de procesos con estados `nuevo`, `listo`, `ejecutando`, `bloqueado`, `suspendido` y `terminado`
- Apertura y cierre de aplicaciones simuladas
- Generación y descarga de reportes de sesión
- Escritorio interactivo
- Autenticación de usuarios
- Control manual de la simulación

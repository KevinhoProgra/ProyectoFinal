
# Proyecto Final MiniOS

Aplicación web desarrollada como proyecto final para simular el funcionamiento básico de un sistema operativo, permitiendo visualizar y administrar procesos, monitorear recursos del sistema.

El proyecto está dividido en un cliente (frontend) y un servidor (backend), manteniendo separada la interfaz de usuario de la lógica del servidor.




## Tech Stack

**Client:** React, TypeScript, Vite, CSS, JavaScript

**Server:** Node.js, JavaScript


## Authors

- [@KevinhoProgra](https://github.com/KevinhoProgra)
- [@KaelCarranza](https://github.com/KaelCarranza)
- [@keymoa22](https://github.com/keymoa22)



## Documentation

[Documentation]([https://github.com/KevinhoProgra/ProyectoFinal/blob/main/Proyecto%20Final%20Documentacion.pdf])


## Installation

Install my-project with npm

```bash
  cd ProyectoFinal
  cd Client
  npm install
```


    
## Deployment

To deploy this project run

```bash
  cd client
  npm run dev
```

```bash
  cd server
  npm start
```


## Project Structure

```text
ProjectFinal/
│
├── client/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── controls/
│   │   │   ├── Desktop/
│   │   │   ├── layout/
│   │   │   ├── login/
│   │   │   ├── Monitor/
│   │   │   └── ProcessTable/
│   │   │
│   │   ├── data/
│   │   ├── Styles/
│   │   ├── types/
│   │   ├── utils/
│   │   │
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── server.js
│   └── package.json
│
├── shared/
│
├── .gitignore
└── README.md
```
## API Reference

#### Get system state

```http
  GET /api/state
```

Devuelve el estado completo del sistema: procesos activos, estadísticas (CPU, RAM, disco), algoritmo de planificación y catálogo de apps.

No requiere parámetros.

#### Get available apps

```http
  GET /api/apps
```

Devuelve el catálogo de aplicaciones disponibles para abrir (Word, Chrome, Spotify, etc).

No requiere parámetros.

#### Open an app

```http
  POST /api/apps/open
```

| Parameter | Type     | Description                                  |
| :-------- | :------- | :-------------------------------------------- |
| `appId`   | `string` | **Required**. Id de la app a abrir (`word`, `chrome`, `spotify`, `explorer`, `calculator`, `terminal`, `vscode`, `paint`, `settings`) |

#### Update process

```http
  POST /api/processes
```

| Parameter | Type     | Description                                          |
| :-------- | :------- | :---------------------------------------------------- |
| `pid`     | `number` | **Required**. Id del proceso                          |
| `action`  | `string` | **Required**. `terminate` para finalizar, `cleanup` para eliminar un proceso ya terminado |

#### Toggle simulation

```http
  POST /api/simulation/toggle
```

| Parameter   | Type      | Description                                              |
| :---------- | :-------- | :--------------------------------------------------------- |
| `isRunning` | `boolean` | Opcional. Si se omite, invierte el estado actual (correr/pausar) |

#### Step simulation

```http
  POST /api/simulation/step
```

Ejecuta manualmente un ciclo (tick) del planificador.

No requiere parámetros.

#### Reset simulation

```http
  POST /api/simulation/reset
```

Reinicia la simulación a sus valores por defecto (Round Robin, quantum 3, sin procesos).

No requiere parámetros.

#### Update scheduler config

```http
  POST /api/simulation/config
```

| Parameter   | Type     | Description                                                       |
| :---------- | :------- | :------------------------------------------------------------------ |
| `algorithm` | `string` | Opcional. `Round Robin`, `SJF` o `Prioridades`                     |
| `quantum`   | `number` | Opcional. Entero mínimo 1 (usado solo en Round Robin)               |


## Features

- Simulación en tiempo real de un planificador de procesos (scheduler)
- Soporte para múltiples algoritmos de planificación: Round Robin, SJF y Prioridades
- Configuración de quantum para Round Robin
- Panel de monitoreo del sistema (uso de CPU, RAM y disco en vivo)
- Tabla de procesos con estados (nuevo, listo, ejecutando, bloqueado, terminado)
- Apertura y cierre de aplicaciones simuladas (Word, Chrome, Spotify, Explorador, Calculadora, Terminal, VSCode, Paint, Ajustes)
- Escritorio interactivo con íconos de aplicaciones
- Autenticación de usuarios con inicio de sesión
- Control manual de la simulación (paso a paso, iniciar/pausar, reiniciar)


## Screenshots

![App Screenshot](https://dummyimage.com/468x300?text=App+Screenshot+Here)


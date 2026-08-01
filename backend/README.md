# API - Empresa Vehiculos

Backend REST en Node.js + Express 5 + MySQL, con autenticacion JWT y permisos por rol.

## Arrancar

```bash
cd backend
npm install
npm run seed     # crea los permisos, el rol Administrador y el usuario admin
npm run dev
```

La API queda en `http://localhost:3000/api`. Requiere que la base `empresa_vehiculos`
exista (`backend/db/01_empresa_vehiculos.sql`) y que MySQL de XAMPP este corriendo.

Usuario inicial: **admin / Empresa2026\*** (se cambia con `ADMIN_PASSWORD` en el `.env`).

## Estructura

```
src/
  server.js              arranca el servidor
  app.js                 middlewares globales y montaje de /api
  config/db.js           pool de conexiones MySQL
  middlewares/           auth (token y permisos), errores, bitacora
  models/                consultas SQL          <- la M de MVC
  controllers/           reciben req, devuelven res  <- la C de MVC
  routes/                definen las URLs y su permiso
```

La "V" (vista) es el frontend en React: esta API solo devuelve JSON.

Los recursos con CRUD identico (clientes, vehiculos, proveedores, etc.) se arman con
las fabricas `crearModeloCrud` / `crearControladorCrud` / `crearRutasCrud`, para no
repetir el mismo archivo ocho veces. Los que tienen logica propia (ventas,
mantenimientos, usuarios, roles) tienen su archivo dedicado.

## Autenticacion

Todas las rutas menos `/api/salud` y `/api/auth/login` exigen el header:

```
Authorization: Bearer <token>
```

El token dura 8 horas y ya trae adentro el arreglo de permisos del usuario.

```js
// Ejemplo desde React
const res = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ usuario: 'admin', password: 'Empresa2026*' }),
});
const { token, usuario } = await res.json();
localStorage.setItem('token', token);
```

## Endpoints

### Publicos
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/salud` | Verifica que la API responde |
| POST | `/api/auth/login` | `{ usuario, password }` -> `{ token, usuario }` |

### Sesion
| Metodo | Ruta | Permiso |
|---|---|---|
| GET | `/api/auth/perfil` | solo token |
| GET | `/api/catalogos` | solo token. Marcas, tipos, estados y roles para los `<select>` |

### CRUD estandar
Todos aceptan `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.

| Ruta | Permisos |
|---|---|
| `/api/clientes` | `clientes.*` |
| `/api/vehiculos` | `vehiculos.*` |
| `/api/distribuidores` | `distribuidores.*` |
| `/api/proveedores` | `proveedores.*` |
| `/api/repuestos` | `repuestos.*` |
| `/api/marcas` | `vehiculos.*` |
| `/api/tipos-vehiculo` | `vehiculos.*` |
| `/api/estados-vehiculo` | `vehiculos.*` |
| `/api/usuarios` | `usuarios.*` |

En `/api/vehiculos` y `/api/repuestos` el listado trae los nombres ya resueltos
(`marca`, `tipo`, `estado`), mientras que `GET /:id` trae los `*_id` crudos, que es lo
que necesita un formulario de edicion.

`DELETE /api/usuarios/:id` no borra: desactiva (`activo = false`).

### Roles y permisos
| Metodo | Ruta | Permiso |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/roles` | `usuarios.*` |
| GET | `/api/roles/:id/permisos` | `usuarios.ver` |
| PUT | `/api/roles/:id/permisos` | `usuarios.editar`. Body: `{ permisos: [1,2,3] }` |
| GET | `/api/permisos` | `usuarios.ver` |

### Ventas
| Metodo | Ruta | Permiso |
|---|---|---|
| GET | `/api/ventas` | `ventas.ver` |
| GET | `/api/ventas/:id` | `ventas.ver`. Incluye el `detalle` |
| POST | `/api/ventas` | `ventas.crear` |
| PUT | `/api/ventas/:id` | `ventas.editar`. Solo cabecera |
| DELETE | `/api/ventas/:id` | `ventas.eliminar`. **Anula**, no borra |

```jsonc
// POST /api/ventas
{
  "cliente_id": 1,
  "metodo_pago": "efectivo",          // efectivo | tarjeta | transferencia | financiamiento
  "observaciones": "Pago de contado",
  "detalle": [{ "vehiculo_id": 3, "descuento": 0 }]
}
```

El vendedor sale del token. Los precios y el IVA los calcula el servidor: no mandes
montos desde el frontend, se ignoran. Al facturar, los vehiculos pasan a `Vendido`
automaticamente; al anular vuelven a `Disponible`.

### Mantenimientos
| Metodo | Ruta | Permiso |
|---|---|---|
| GET | `/api/mantenimientos` | `mantenimientos.ver` |
| GET | `/api/mantenimientos/:id` | `mantenimientos.ver`. Incluye `repuestos` |
| POST | `/api/mantenimientos` | `mantenimientos.crear` |
| PUT | `/api/mantenimientos/:id` | `mantenimientos.editar` |

```jsonc
// POST /api/mantenimientos
{
  "vehiculo_id": 5,
  "cliente_id": 2,
  "descripcion_problema": "Ruido al frenar",
  "monto_mano_obra": 45000,
  "repuestos": [{ "repuesto_id": 3, "cantidad": 2 }]
}
```

Descuenta el stock en la misma transaccion. Si un repuesto no alcanza devuelve 409 y no
se guarda nada. Al poner `estado: "entregado"` el vehiculo vuelve a `Disponible`.

### Reportes
| Ruta | Devuelve |
|---|---|
| `/api/reportes/resumen` | Tarjetas del Dashboard (totales) |
| `/api/reportes/ingresos-mensuales` | Facturacion agrupada por mes |
| `/api/reportes/ventas` | Cada vehiculo vendido con cliente y vendedor |
| `/api/reportes/vehiculos` | Inventario con margen de ganancia |
| `/api/reportes/repuestos-bajo-stock` | Repuestos en o bajo el minimo |
| `/api/reportes/mantenimientos` | Ordenes con costo de repuestos y total |

Todos piden `reportes.ver`. Ademas `/api/bitacora` (`bitacora.ver`) devuelve la auditoria.

## Codigos de respuesta

| Codigo | Significado |
|---|---|
| 200 / 201 / 204 | Todo bien |
| 400 | Datos invalidos o faltantes |
| 401 | Sin token, o token vencido |
| 403 | Token valido pero sin el permiso necesario |
| 404 | No existe |
| 409 | Conflicto: duplicado, sin stock, o hay registros que dependen |
| 503 | Sin conexion a la base de datos |

Los errores siempre vienen como `{ "mensaje": "..." }`.

## Datos iniciales

`npm run seed` NO carga datos de negocio. Solo crea:

- **35 permisos**: son contrato del codigo (`requierePermiso('ventas.crear')`) y la API
  no expone `POST /permisos`, asi que no se pueden crear desde el sistema.
- **Rol Administrador** con todos los permisos.
- **Usuario admin**.

Todo lo demas —roles adicionales, marcas, tipos y estados de vehiculo, clientes,
distribuidores, proveedores, repuestos— se registra desde el sistema.

Correr el seed de nuevo despues de actualizar el codigo es util: le asigna al
Administrador los permisos nuevos que se hayan agregado.

### Estados de vehiculo con nombre exacto

Al facturar y al recibir un vehiculo en el taller, el backend busca estos estados
por nombre. Hay que registrarlos con la escritura exacta:

| Nombre | Lo usa |
|---|---|
| `Disponible` | Al anular una venta y al entregar un mantenimiento |
| `Vendido` | Al registrar una venta |
| `En mantenimiento` | Al crear una orden de mantenimiento |

Si falta alguno, la API responde 409 diciendo cual es. Los demas estados
(`Reservado`, `Fuera de servicio`, o los que quieras) son libres.

## Pendientes conocidos

- **Paginacion**: los listados devuelven todo. Agregar `?pagina=&limite=` cuando las tablas crezcan.
- **Limite de intentos de login**: hoy solo se registran en la bitacora. Agregar `express-rate-limit` si sale a internet.
- **Refresh token**: al vencer las 8 horas hay que volver a iniciar sesion.
- Cambiar los permisos de un rol exige que el usuario vuelva a loguearse (los permisos viajan en el token).

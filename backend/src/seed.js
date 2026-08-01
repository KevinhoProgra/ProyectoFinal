/**
 * Inicializa el sistema con lo MINIMO indispensable para poder entrar:
 *   - el catalogo de permisos
 *   - el rol Administrador con todos los permisos
 *   - el usuario admin
 *
 * NO carga marcas, tipos, estados, clientes, vehiculos ni usuarios adicionales:
 * todo eso se registra desde el sistema.
 *
 * Los permisos son la unica excepcion porque son contrato del codigo
 * (requierePermiso('ventas.crear')) y la API no expone POST /permisos.
 *
 * Se puede correr varias veces sin duplicar nada.
 *
 * Uso:  npm run seed
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './config/db.js';

const MODULOS = {
  usuarios: 'usuarios y roles',
  clientes: 'clientes',
  vehiculos: 'vehículos y catálogos',
  distribuidores: 'distribuidores',
  proveedores: 'proveedores',
  repuestos: 'repuestos',
  ventas: 'ventas',
  mantenimientos: 'mantenimientos',
};
const ACCIONES = ['ver', 'crear', 'editar', 'eliminar'];

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Empresa2026*';

async function inicializar() {
  const permisos = [];
  for (const [modulo, descripcion] of Object.entries(MODULOS)) {
    for (const accion of ACCIONES) {
      permisos.push([`${modulo}.${accion}`, modulo, accion, `${accion} ${descripcion}`]);
    }
  }
  permisos.push(['reportes.ver', 'reportes', 'ver', 'Ver reportes y estadísticas']);
  permisos.push(['reportes.exportar', 'reportes', 'exportar', 'Exportar reportes']);
  permisos.push(['bitacora.ver', 'bitacora', 'ver', 'Ver la bitácora de auditoría']);
  await pool.query('INSERT IGNORE INTO permisos (clave, modulo, accion, descripcion) VALUES ?', [permisos]);

  await pool.query(
    "INSERT IGNORE INTO roles (nombre, descripcion) VALUES ('Administrador', 'Acceso total al sistema')",
  );

  // El administrador siempre tiene todos los permisos, incluso los que se
  // agreguen despues: por eso conviene volver a correr el seed tras actualizar.
  await pool.query(`
    INSERT IGNORE INTO rol_permiso (rol_id, permiso_id)
    SELECT r.id, p.id FROM roles r CROSS JOIN permisos p WHERE r.nombre = 'Administrador'`);

  const [[admin]] = await pool.query("SELECT id FROM usuarios WHERE usuario = 'admin'");
  if (admin) {
    console.log('El usuario admin ya existe, no se tocó su contraseña.');
  } else {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await pool.query(
      `INSERT INTO usuarios (cedula, nombre, apellidos, usuario, email, password_hash, rol_id)
       SELECT '000000000', 'Administrador', 'del Sistema', 'admin', 'admin@empresavehiculos.cr', ?, id
       FROM roles WHERE nombre = 'Administrador'`,
      [hash],
    );
    console.log(`Usuario creado -> admin / ${ADMIN_PASSWORD}`);
  }

  const [[conteo]] = await pool.query(`
    SELECT (SELECT COUNT(*) FROM permisos) AS permisos,
           (SELECT COUNT(*) FROM roles) AS roles,
           (SELECT COUNT(*) FROM usuarios) AS usuarios`);
  console.log('Sistema inicializado:', conteo);
  console.log('Lo demás (roles, marcas, tipos y estados de vehículo) se registra desde el sistema.');
}

try {
  await inicializar();
} catch (error) {
  console.error('Falló la inicialización:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

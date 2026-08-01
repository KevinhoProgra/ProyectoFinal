import mysql from 'mysql2/promise';

// Pool de conexiones: reutiliza conexiones en vez de abrir una por consulta.
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USUARIO,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NOMBRE,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4_unicode_ci',
  // Sin esto los DECIMAL llegan como texto ("17900000.00") al frontend.
  decimalNumbers: true,
});

// XAMPP no trae el modo estricto activado: sin esto un INSERT sin la columna
// obligatoria guarda cadena vacia en vez de fallar, y entra basura a la base.
pool.on('connection', (conexion) => {
  conexion.query("SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'");
});

export async function probarConexion() {
  const conexion = await pool.getConnection();
  await conexion.ping();
  conexion.release();
  console.log(`Conectado a MySQL: ${process.env.DB_NOMBRE}`);
}

DROP DATABASE IF EXISTS empresa_vehiculos;
CREATE DATABASE empresa_vehiculos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE empresa_vehiculos;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE roles (
  id            TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(40)  NOT NULL,
  descripcion   VARCHAR(160) NOT NULL,
  activo        BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE permisos (
  id            SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  clave         VARCHAR(60)  NOT NULL,
  modulo        VARCHAR(30)  NOT NULL,
  accion        VARCHAR(20)  NOT NULL,
  descripcion   VARCHAR(160) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_permisos_clave (clave),
  KEY idx_permisos_modulo (modulo)
) ENGINE=InnoDB;

CREATE TABLE rol_permiso (
  rol_id        TINYINT UNSIGNED  NOT NULL,
  permiso_id    SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (rol_id, permiso_id),
  CONSTRAINT fk_rp_rol     FOREIGN KEY (rol_id)     REFERENCES roles(id)    ON DELETE CASCADE,
  CONSTRAINT fk_rp_permiso FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cedula          VARCHAR(20)  NOT NULL,
  nombre          VARCHAR(60)  NOT NULL,
  apellidos       VARCHAR(80)  NOT NULL,
  usuario         VARCHAR(40)  NOT NULL,
  email           VARCHAR(120) NOT NULL,
  telefono        VARCHAR(20)      NULL,
  password_hash   CHAR(60)     NOT NULL,
  rol_id          TINYINT UNSIGNED NOT NULL,
  activo          BOOLEAN      NOT NULL DEFAULT TRUE,
  ultimo_acceso   DATETIME         NULL,
  creado_en       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_usuario (usuario),
  UNIQUE KEY uq_usuarios_email   (email),
  UNIQUE KEY uq_usuarios_cedula  (cedula),
  KEY idx_usuarios_rol (rol_id),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT,
  CONSTRAINT ck_usuarios_email CHECK (email LIKE '%_@_%._%')
) ENGINE=InnoDB;

CREATE TABLE bitacora (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED     NULL,
  accion          VARCHAR(60)  NOT NULL,
  tabla_afectada  VARCHAR(60)      NULL,
  registro_id     VARCHAR(40)      NULL,
  detalle         VARCHAR(255)     NULL,
  ip              VARCHAR(45)      NULL,
  fecha           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bitacora_usuario (usuario_id),
  KEY idx_bitacora_fecha   (fecha),
  CONSTRAINT fk_bitacora_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;


CREATE TABLE marcas (
  id      SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre  VARCHAR(50) NOT NULL,
  pais    VARCHAR(50)     NULL,
  activo  BOOLEAN     NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uq_marcas_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE tipos_vehiculo (
  id      SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre  VARCHAR(40) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tipos_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE estados_vehiculo (
  id      TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre  VARCHAR(30) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_estados_nombre (nombre)
) ENGINE=InnoDB;


CREATE TABLE clientes (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cedula          VARCHAR(20)  NOT NULL,
  nombre          VARCHAR(60)  NOT NULL,
  apellidos       VARCHAR(80)  NOT NULL,
  email           VARCHAR(120)     NULL,
  telefono        VARCHAR(20)  NOT NULL,
  direccion       VARCHAR(200)     NULL,
  activo          BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_cedula (cedula),
  KEY idx_clientes_apellidos (apellidos)
) ENGINE=InnoDB;

CREATE TABLE distribuidores (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cedula      VARCHAR(20)  NOT NULL,
  nombre      VARCHAR(60)  NOT NULL,
  apellidos   VARCHAR(80)  NOT NULL,
  marca_id    SMALLINT UNSIGNED NOT NULL,
  telefono    VARCHAR(20)      NULL,
  email       VARCHAR(120)     NULL,
  activo      BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_distribuidores_cedula (cedula),
  KEY idx_distribuidores_marca (marca_id),
  CONSTRAINT fk_distribuidores_marca FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE proveedores (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cedula_juridica VARCHAR(20)  NOT NULL,
  nombre_empresa  VARCHAR(120) NOT NULL,
  contacto        VARCHAR(120)     NULL,
  telefono        VARCHAR(20)  NOT NULL,
  email           VARCHAR(120)     NULL,
  direccion       VARCHAR(200)     NULL,
  activo          BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_proveedores_cj (cedula_juridica)
) ENGINE=InnoDB;

CREATE TABLE vehiculos (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  vin             VARCHAR(17)  NOT NULL,
  placa           VARCHAR(10)      NULL,
  marca_id        SMALLINT UNSIGNED NOT NULL,
  modelo          VARCHAR(60)  NOT NULL,
  anio            SMALLINT UNSIGNED NOT NULL,
  color           VARCHAR(30)      NULL,
  tipo_id         SMALLINT UNSIGNED NOT NULL,
  estado_id       TINYINT UNSIGNED NOT NULL DEFAULT 1,
  distribuidor_id INT UNSIGNED     NULL,
  kilometraje     INT UNSIGNED NOT NULL DEFAULT 0,
  precio_costo    DECIMAL(12,2) NOT NULL,
  precio_venta    DECIMAL(12,2) NOT NULL,
  creado_en       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehiculos_vin   (vin),
  UNIQUE KEY uq_vehiculos_placa (placa),
  KEY idx_vehiculos_marca  (marca_id),
  KEY idx_vehiculos_tipo   (tipo_id),
  KEY idx_vehiculos_estado (estado_id),
  KEY idx_vehiculos_dist   (distribuidor_id),
  CONSTRAINT fk_vehiculos_marca  FOREIGN KEY (marca_id)        REFERENCES marcas(id)            ON DELETE RESTRICT,
  CONSTRAINT fk_vehiculos_tipo   FOREIGN KEY (tipo_id)         REFERENCES tipos_vehiculo(id)    ON DELETE RESTRICT,
  CONSTRAINT fk_vehiculos_estado FOREIGN KEY (estado_id)       REFERENCES estados_vehiculo(id)  ON DELETE RESTRICT,
  CONSTRAINT fk_vehiculos_dist   FOREIGN KEY (distribuidor_id) REFERENCES distribuidores(id)    ON DELETE SET NULL,
  CONSTRAINT ck_vehiculos_anio   CHECK (anio BETWEEN 1950 AND 2100),
  CONSTRAINT ck_vehiculos_precio CHECK (precio_costo >= 0 AND precio_venta >= 0)
) ENGINE=InnoDB;

CREATE TABLE repuestos (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo        VARCHAR(30)  NOT NULL,
  nombre        VARCHAR(120) NOT NULL,
  descripcion   VARCHAR(255)     NULL,
  proveedor_id  INT UNSIGNED NOT NULL,
  marca_id      SMALLINT UNSIGNED NULL,
  precio_compra DECIMAL(12,2) NOT NULL,
  precio_venta  DECIMAL(12,2) NOT NULL,
  stock         INT NOT NULL DEFAULT 0,
  stock_minimo  INT NOT NULL DEFAULT 0,
  activo        BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_repuestos_codigo (codigo),
  KEY idx_repuestos_proveedor (proveedor_id),
  KEY idx_repuestos_marca     (marca_id),
  CONSTRAINT fk_repuestos_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE RESTRICT,
  CONSTRAINT fk_repuestos_marca     FOREIGN KEY (marca_id)     REFERENCES marcas(id)      ON DELETE SET NULL,
  CONSTRAINT ck_repuestos_stock     CHECK (stock >= 0 AND stock_minimo >= 0)
) ENGINE=InnoDB;


CREATE TABLE ventas (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  numero_factura  VARCHAR(20)  NOT NULL,
  cliente_id      INT UNSIGNED NOT NULL,
  usuario_id      INT UNSIGNED NOT NULL,
  fecha           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuento       DECIMAL(12,2) NOT NULL DEFAULT 0,
  impuesto        DECIMAL(12,2) NOT NULL DEFAULT 0,
  total           DECIMAL(12,2) NOT NULL DEFAULT 0,
  metodo_pago     ENUM('efectivo','tarjeta','transferencia','financiamiento') NOT NULL DEFAULT 'efectivo',
  estado          ENUM('pendiente','pagada','anulada') NOT NULL DEFAULT 'pendiente',
  observaciones   VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ventas_factura (numero_factura),
  KEY idx_ventas_cliente (cliente_id),
  KEY idx_ventas_usuario (usuario_id),
  KEY idx_ventas_fecha   (fecha),
  CONSTRAINT fk_ventas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ventas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  CONSTRAINT ck_ventas_montos  CHECK (subtotal >= 0 AND descuento >= 0 AND total >= 0)
) ENGINE=InnoDB;

CREATE TABLE venta_detalle (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  venta_id        INT UNSIGNED NOT NULL,
  vehiculo_id     INT UNSIGNED NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  descuento       DECIMAL(12,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_detalle_venta_vehiculo (venta_id, vehiculo_id),
  KEY idx_detalle_vehiculo (vehiculo_id),
  CONSTRAINT fk_detalle_venta    FOREIGN KEY (venta_id)    REFERENCES ventas(id)    ON DELETE CASCADE,
  CONSTRAINT fk_detalle_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE RESTRICT,
  CONSTRAINT ck_detalle_precio   CHECK (precio_unitario >= 0 AND descuento >= 0)
) ENGINE=InnoDB;

CREATE TABLE mantenimientos (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo               VARCHAR(20)  NOT NULL,
  vehiculo_id          INT UNSIGNED NOT NULL,
  cliente_id           INT UNSIGNED NOT NULL,
  usuario_id           INT UNSIGNED NOT NULL,
  fecha_ingreso        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega        DATETIME         NULL,
  descripcion_problema TEXT         NOT NULL,
  diagnostico          TEXT             NULL,
  monto_mano_obra      DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado               ENUM('recibido','en_proceso','finalizado','entregado','cancelado') NOT NULL DEFAULT 'recibido',
  PRIMARY KEY (id),
  UNIQUE KEY uq_mant_codigo (codigo),
  KEY idx_mant_vehiculo (vehiculo_id),
  KEY idx_mant_cliente  (cliente_id),
  KEY idx_mant_usuario  (usuario_id),
  KEY idx_mant_estado   (estado),
  CONSTRAINT fk_mant_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE RESTRICT,
  CONSTRAINT fk_mant_cliente  FOREIGN KEY (cliente_id)  REFERENCES clientes(id)  ON DELETE RESTRICT,
  CONSTRAINT fk_mant_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE RESTRICT,
  CONSTRAINT ck_mant_fechas   CHECK (fecha_entrega IS NULL OR fecha_entrega >= fecha_ingreso),
  CONSTRAINT ck_mant_monto    CHECK (monto_mano_obra >= 0)
) ENGINE=InnoDB;

CREATE TABLE mantenimiento_repuesto (
  mantenimiento_id INT UNSIGNED NOT NULL,
  repuesto_id      INT UNSIGNED NOT NULL,
  cantidad         SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  precio_unitario  DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (mantenimiento_id, repuesto_id),
  KEY idx_mr_repuesto (repuesto_id),
  CONSTRAINT fk_mr_mantenimiento FOREIGN KEY (mantenimiento_id) REFERENCES mantenimientos(id) ON DELETE CASCADE,
  CONSTRAINT fk_mr_repuesto      FOREIGN KEY (repuesto_id)      REFERENCES repuestos(id)      ON DELETE RESTRICT,
  CONSTRAINT ck_mr_cantidad      CHECK (cantidad > 0 AND precio_unitario >= 0)
) ENGINE=InnoDB;


CREATE OR REPLACE VIEW vw_permisos_usuario AS
SELECT u.id AS usuario_id, u.usuario, r.nombre AS rol, p.clave AS permiso, p.modulo, p.accion
FROM usuarios u
JOIN roles r        ON r.id  = u.rol_id
JOIN rol_permiso rp ON rp.rol_id = r.id
JOIN permisos p     ON p.id  = rp.permiso_id
WHERE u.activo = TRUE AND r.activo = TRUE;

CREATE OR REPLACE VIEW vw_vehiculos_detalle AS
SELECT v.id, v.vin, v.placa, m.nombre AS marca, v.modelo, v.anio, v.color,
       t.nombre AS tipo, e.nombre AS estado, v.kilometraje,
       v.precio_costo, v.precio_venta,
       (v.precio_venta - v.precio_costo) AS margen,
       CONCAT_WS(' ', d.nombre, d.apellidos) AS distribuidor
FROM vehiculos v
JOIN marcas m            ON m.id = v.marca_id
JOIN tipos_vehiculo t    ON t.id = v.tipo_id
JOIN estados_vehiculo e  ON e.id = v.estado_id
LEFT JOIN distribuidores d ON d.id = v.distribuidor_id;

CREATE OR REPLACE VIEW vw_ventas_detalle AS
SELECT ve.numero_factura, ve.fecha, ve.estado, ve.metodo_pago,
       CONCAT_WS(' ', c.nombre, c.apellidos) AS cliente, c.cedula AS cedula_cliente,
       CONCAT_WS(' ', u.nombre, u.apellidos) AS vendedor,
       m.nombre AS marca, v.modelo, v.vin, t.nombre AS tipo,
       vd.precio_unitario, vd.descuento,
       (vd.precio_unitario - vd.descuento) AS total_linea
FROM ventas ve
JOIN venta_detalle vd ON vd.venta_id = ve.id
JOIN vehiculos v      ON v.id  = vd.vehiculo_id
JOIN marcas m         ON m.id  = v.marca_id
JOIN tipos_vehiculo t ON t.id  = v.tipo_id
JOIN clientes c       ON c.id  = ve.cliente_id
JOIN usuarios u       ON u.id  = ve.usuario_id;

CREATE OR REPLACE VIEW vw_ingresos_mensuales AS
SELECT DATE_FORMAT(fecha, '%Y-%m') AS periodo,
       COUNT(*)      AS cantidad_ventas,
       SUM(subtotal) AS subtotal,
       SUM(impuesto) AS impuesto,
       SUM(total)    AS total_facturado
FROM ventas
WHERE estado <> 'anulada'
GROUP BY DATE_FORMAT(fecha, '%Y-%m');

CREATE OR REPLACE VIEW vw_repuestos_bajo_stock AS
SELECT r.id, r.codigo, r.nombre, r.stock, r.stock_minimo,
       (r.stock_minimo - r.stock) AS faltante,
       p.nombre_empresa AS proveedor, p.telefono
FROM repuestos r
JOIN proveedores p ON p.id = r.proveedor_id
WHERE r.activo = TRUE AND r.stock <= r.stock_minimo;

CREATE OR REPLACE VIEW vw_mantenimientos_costo AS
SELECT mt.id, mt.codigo, mt.estado, mt.fecha_ingreso, mt.fecha_entrega,
       CONCAT_WS(' ', c.nombre, c.apellidos) AS cliente,
       CONCAT(m.nombre,' ',v.modelo,' (',IFNULL(v.placa,'sin placa'),')') AS vehiculo,
       CONCAT_WS(' ', u.nombre, u.apellidos) AS mecanico,
       mt.monto_mano_obra,
       IFNULL(SUM(mr.cantidad * mr.precio_unitario), 0) AS costo_repuestos,
       mt.monto_mano_obra + IFNULL(SUM(mr.cantidad * mr.precio_unitario), 0) AS total
FROM mantenimientos mt
JOIN vehiculos v ON v.id = mt.vehiculo_id
JOIN marcas m    ON m.id = v.marca_id
JOIN clientes c  ON c.id = mt.cliente_id
JOIN usuarios u  ON u.id = mt.usuario_id
LEFT JOIN mantenimiento_repuesto mr ON mr.mantenimiento_id = mt.id
GROUP BY mt.id, mt.codigo, mt.estado, mt.fecha_ingreso, mt.fecha_entrega,
         cliente, vehiculo, mecanico, mt.monto_mano_obra;

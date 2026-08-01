import { crearModeloCrud } from './crud.model.js';

export const repuestoModel = crearModeloCrud({
  tabla: 'repuestos',
  campos: [
    'codigo', 'nombre', 'descripcion', 'proveedor_id', 'marca_id',
    'precio_compra', 'precio_venta', 'stock', 'stock_minimo', 'activo',
  ],
  sqlListar: `
    SELECT r.*, p.nombre_empresa AS proveedor, m.nombre AS marca_compatible,
           (r.stock <= r.stock_minimo) AS bajo_stock
    FROM repuestos r
    JOIN proveedores p ON p.id = r.proveedor_id
    LEFT JOIN marcas m ON m.id = r.marca_id
    ORDER BY r.nombre`,
});

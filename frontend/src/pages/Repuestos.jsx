import { useEffect, useState } from 'react';
import { api } from '../api/cliente';
import TablaCrud from '../Components/TablaCrud';

function Repuestos() {
  const [proveedoresOpciones, setProveedoresOpciones] = useState(null);
  const [marcas, setMarcas] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/proveedores'),
      api.get('/catalogos').then((c) => c.marcas),
    ])
      .then(([listaProveedores, listaMarcas]) => {
        // Transformar proveedores para que tengan nombre en lugar de nombre_empresa
        const opcionesProveedores = listaProveedores.map(p => ({
          id: p.id,
          nombre: p.nombre_empresa,
        }));
        setProveedoresOpciones(opcionesProveedores);
        setMarcas(listaMarcas);
      })
      .catch(() => {
        setProveedoresOpciones([]);
        setMarcas([]);
      });
  }, []);

  if (!proveedoresOpciones || !marcas) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Repuestos</h1>
        <p className="text-gray-600 mt-1">Inventario de repuestos para vehículos.</p>
      </div>

      {proveedoresOpciones.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          No hay proveedores registrados. Agrega al menos uno en la sección de Proveedores antes de crear un repuesto.
        </div>
      )}

      <TablaCrud
        titulo="Listado de Repuestos"
        ruta="/repuestos"
        modulo="repuestos"
        campos={[
          { nombre: 'codigo', etiqueta: 'Código', requerido: true },
          { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
          { nombre: 'descripcion', etiqueta: 'Descripción' },
          { nombre: 'proveedor_id', etiqueta: 'Proveedor', tipo: 'select', opciones: proveedoresOpciones, requerido: true },
          { nombre: 'marca_id', etiqueta: 'Marca', tipo: 'select', opciones: marcas },
          { nombre: 'precio_compra', etiqueta: 'Precio de Compra', tipo: 'number', requerido: true },
          { nombre: 'precio_venta', etiqueta: 'Precio de Venta', tipo: 'number', requerido: true },
          { nombre: 'stock', etiqueta: 'Stock', tipo: 'number', requerido: true },
          { nombre: 'stock_minimo', etiqueta: 'Stock Mínimo', tipo: 'number', requerido: true },
          { nombre: 'activo', etiqueta: 'Activo', tipo: 'checkbox' },
        ]}
        columnas={[
          { clave: 'codigo', etiqueta: 'Código' },
          { clave: 'nombre', etiqueta: 'Nombre' },
          { clave: 'stock', etiqueta: 'Stock' },
          { clave: 'stock_minimo', etiqueta: 'Mínimo' },
          { clave: 'precio_venta', etiqueta: 'Precio' },
        ]}
      />
    </div>
  );
}

export default Repuestos;

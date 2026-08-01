import TablaCrud from '../Components/TablaCrud';

function Proveedores() {
  return (
    <TablaCrud
      titulo="Proveedores"
      descripcion="Gestión de proveedores de repuestos."
      ruta="/proveedores"
      modulo="proveedores"
      campos={[
        { nombre: 'cedula_juridica', etiqueta: 'Cédula Jurídica', requerido: true },
        { nombre: 'nombre_empresa', etiqueta: 'Nombre de la Empresa', requerido: true },
        { nombre: 'contacto', etiqueta: 'Contacto' },
        { nombre: 'telefono', etiqueta: 'Teléfono', requerido: true },
        { nombre: 'email', etiqueta: 'Email', tipo: 'email' },
        { nombre: 'direccion', etiqueta: 'Dirección' },
        { nombre: 'activo', etiqueta: 'Activo', tipo: 'checkbox' },
      ]}
      columnas={[
        { clave: 'cedula_juridica', etiqueta: 'Cédula Jurídica' },
        { clave: 'nombre_empresa', etiqueta: 'Empresa' },
        { clave: 'contacto', etiqueta: 'Contacto' },
        { clave: 'telefono', etiqueta: 'Teléfono' },
        { clave: 'email', etiqueta: 'Email' },
      ]}
    />
  );
}

export default Proveedores;

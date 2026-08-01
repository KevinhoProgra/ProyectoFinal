import TablaCrud from '../Components/TablaCrud';

function Clientes() {
  return (
    <TablaCrud
      titulo="Clientes"
      descripcion="Gestión de clientes del negocio."
      ruta="/clientes"
      modulo="clientes"
      campos={[
        { nombre: 'cedula', etiqueta: 'Cédula', requerido: true },
        { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
        { nombre: 'apellidos', etiqueta: 'Apellidos', requerido: true },
        { nombre: 'email', etiqueta: 'Email' },
        { nombre: 'telefono', etiqueta: 'Teléfono', requerido: true },
        { nombre: 'direccion', etiqueta: 'Dirección' },
        { nombre: 'activo', etiqueta: 'Activo', tipo: 'checkbox' },
      ]}
      columnas={[
        { clave: 'cedula', etiqueta: 'Cédula' },
        { clave: 'nombre', etiqueta: 'Nombre' },
        { clave: 'apellidos', etiqueta: 'Apellidos' },
        { clave: 'email', etiqueta: 'Email' },
        { clave: 'telefono', etiqueta: 'Teléfono' },
      ]}
    />
  );
}

export default Clientes;

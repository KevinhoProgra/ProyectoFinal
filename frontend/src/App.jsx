import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProveedorAuth } from './auth/AuthContext';
import { RutaProtegida } from './auth/RutaProtegida';
import Layout from './layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehiculos from './pages/Vehiculos';
import Catalogos from './pages/Catalogos';
import Clientes from './pages/Clientes';
import Distribuidores from './pages/Distribuidores';
import Proveedores from './pages/Proveedores';
import Repuestos from './pages/Repuestos';
import Reportes from './pages/Reportes';

function App() {
  return (
    <ProveedorAuth>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Todo lo de adentro exige sesion iniciada. */}
          <Route element={<RutaProtegida />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />

              {/* Cada modulo ademas pide su permiso de lectura. */}
              <Route element={<RutaProtegida permiso="vehiculos.ver" />}>
                <Route path="vehiculos" element={<Vehiculos />} />
                <Route path="catalogos" element={<Catalogos />} />
              </Route>
              <Route element={<RutaProtegida permiso="clientes.ver" />}>
                <Route path="clientes" element={<Clientes />} />
              </Route>
              <Route element={<RutaProtegida permiso="distribuidores.ver" />}>
                <Route path="distribuidores" element={<Distribuidores />} />
              </Route>
              <Route element={<RutaProtegida permiso="proveedores.ver" />}>
                <Route path="proveedores" element={<Proveedores />} />
              </Route>
              <Route element={<RutaProtegida permiso="repuestos.ver" />}>
                <Route path="repuestos" element={<Repuestos />} />
              </Route>
              <Route element={<RutaProtegida permiso="reportes.ver" />}>
                <Route path="reportes" element={<Reportes />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ProveedorAuth>
  );
}

export default App;

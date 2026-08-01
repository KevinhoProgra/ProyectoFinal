function Dashboard() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900" >
                Panel principal
            </h1>
            <p className="text-gray-600">Bienvenido al sistema. Aquí conectarás la información de la base de datos más adelante.</p>
      
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-semibold">Total Vehículos</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-semibold">Clientes Activos</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-semibold">Ventas del Mes</h3>
          <p className="text-2xl font-bold mt-2">$0.00</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
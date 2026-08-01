import { Outlet } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Sidebar from '../Components/Sidebar';

function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <footer className="bg-white text-center py-3 border-t border-gray-200 text-sm text-gray-500">
        <p>AutoInventory 2026</p>
      </footer>
    </div>
  );
}

export default Layout;

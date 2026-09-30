import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Inicio', icon: '🏠' },
  { path: '/products', label: 'Productos', icon: '📦' },
  { path: '/clients', label: 'Clientes', icon: '👥' },
  { path: '/orders', label: 'Pedidos', icon: '📋' },
  { path: '/orders/new', label: 'Nuevo Pedido', icon: '➕' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-slate-800 text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-blue-400">📦 Lomax SA</h1>
        <p className="text-sm text-slate-400 mt-1">Gestión de Pedidos</p>
      </div>
      <ul className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path) &&
                !(item.path === '/orders' && location.pathname === '/orders/new');
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
        Tecnologías Emergentes
      </div>
    </nav>
  );
}

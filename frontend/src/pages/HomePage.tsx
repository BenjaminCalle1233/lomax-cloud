import { Link } from 'react-router-dom';

const cards = [
  { title: 'Productos', description: 'Catálogo de productos disponibles', path: '/products', icon: '📦', color: 'bg-blue-500' },
  { title: 'Clientes', description: 'Directorio de clientes registrados', path: '/clients', icon: '👥', color: 'bg-green-500' },
  { title: 'Pedidos', description: 'Historial de pedidos realizados', path: '/orders', icon: '📋', color: 'bg-purple-500' },
  { title: 'Nuevo Pedido', description: 'Registrar un nuevo pedido', path: '/orders/new', icon: '➕', color: 'bg-orange-500' },
];

export default function HomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido a Lomax SA</h1>
        <p className="text-gray-600 mt-2">Plataforma de gestión de pedidos Lomax</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className={`${card.color} p-4 text-white text-center text-4xl`}>
              {card.icon}
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800">{card.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Acerca del Sistema</h2>
        <p className="text-gray-600">
          Lomax SA es una plataforma de gestión empresarial que permite administrar productos,
          clientes y pedidos de manera eficiente. El sistema está construido con tecnologías
          modernas: React, NestJS, PostgreSQL, Docker y Kubernetes.
        </p>
      </div>
    </div>
  );
}

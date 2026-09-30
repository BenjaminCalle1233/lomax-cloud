import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';

interface OrderDetail {
  id: number;
  client: { name: string; nit: string };
  createdAt: string;
  status: string;
  total: string;
  details: {
    id: number;
    product: { name: string };
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }[];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Pedido no encontrado');
        return res.json();
      })
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-10">Cargando pedido...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!order) return null;

  return (
    <div>
      {location.state?.created && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          Pedido registrado correctamente.
        </div>
      )}
      <Link to="/orders" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Volver a pedidos
      </Link>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Pedido #{order.id}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Cliente</p>
            <p className="font-medium">{order.client.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">NIT</p>
            <p className="font-medium">{order.client.nit}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha</p>
            <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('es-BO')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                order.status === 'COMPLETADO'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Unitario</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.details.map((d) => (
              <tr key={d.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.product.name}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-500">{d.quantity}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-500">${Number(d.unitPrice).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">${Number(d.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase">
                Total
              </td>
              <td className="px-6 py-4 text-right text-lg font-bold text-blue-600">
                ${Number(order.total).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}


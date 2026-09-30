import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
}

interface OrderItem {
  productId: number;
  quantity: number;
}

export default function NewOrderPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<number>(0);
  const [items, setItems] = useState<OrderItem[]>([{ productId: 0, quantity: 1 }]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then((r) => {
        if (!r.ok) throw new Error('No se pudieron cargar los clientes');
        return r.json();
      }),
      fetch('/api/products').then((r) => {
        if (!r.ok) throw new Error('No se pudieron cargar los productos');
        return r.json();
      }),
    ])
      .then(([c, p]) => {
        setClients(c);
        setProducts(p);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addItem = () => {
    setItems([...items, { productId: 0, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return sum;
      return sum + Number(product.price) * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedClient === 0) {
      setError('Debe seleccionar un cliente');
      return;
    }

    if (items.length === 0 || items.some((i) => i.productId <= 0 || !Number.isInteger(i.quantity) || i.quantity <= 0)) {
      setError('Seleccione un producto y una cantidad entera positiva en cada fila');
      return;
    }
    if (new Set(items.map((i) => i.productId)).size !== items.length) {
      setError('Cada producto debe aparecer una sola vez');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          items,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al crear el pedido');
      }

      const order = await res.json();
      navigate(`/orders/${order.id}`, { state: { created: true } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10">Cargando datos...</div>;
  if (error && (!clients.length || !products.length)) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Nuevo Pedido</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>Seleccionar cliente...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Productos</h2>
            <button
              type="button"
              onClick={addItem}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              + Agregar producto
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="flex gap-4 items-end mb-4 pb-4 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Producto</label>
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(index, 'productId', Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Seleccionar...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${Number(p.price).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <label className="block text-sm text-gray-600 mb-1">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700 pb-2"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
          <div>
            <span className="text-gray-600">Total estimado: </span>
            <span className="text-2xl font-bold text-blue-600">${getTotal().toFixed(2)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Registrando...' : 'Registrar Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
}


import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import OrderCard from '../components/OrderCard';
import type { OrderStatus } from '../types';
import { Filter, ClipboardList } from 'lucide-react';

const STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
];

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const { getOrdersByCustomer } = useOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  if (!user) return null;

  const allOrders = getOrdersByCustomer(user.id);
  const filtered = statusFilter === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === statusFilter);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Orders</h1>
          <p className="text-muted">{allOrders.length} total orders</p>
        </div>
      </div>

      <div className="filter-bar">
        <Filter size={16} />
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            className={`filter-btn ${statusFilter === f.value ? 'active' : ''}`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} />
          <p>No orders found{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}.</p>
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} showOtp />
          ))}
        </div>
      )}
    </div>
  );
}

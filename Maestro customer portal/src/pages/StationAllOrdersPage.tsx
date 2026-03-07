import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import OrderCard from '../components/OrderCard';
import type { OrderStatus } from '../types';
import { Filter, ClipboardList, CheckCircle2 } from 'lucide-react';

const STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
];

export default function StationAllOrdersPage() {
  const { user } = useAuth();
  const { getOrdersBySite, completeOrder } = useOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  if (!user || !user.siteId) return null;

  const allOrders = getOrdersBySite(user.siteId);
  const filtered = statusFilter === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === statusFilter);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>All Station Orders</h1>
          <p className="text-muted">Site: {user.siteId} — {allOrders.length} total orders</p>
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
            <OrderCard
              key={order.id}
              order={order}
              showOtp
              actions={
                order.status === 'approved' ? (
                  <div className="manager-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => completeOrder(order.id)}
                    >
                      <CheckCircle2 size={18} />
                      Mark as Completed
                    </button>
                  </div>
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

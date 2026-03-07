import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import OrderCard from '../components/OrderCard';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { getOrdersByCustomer } = useOrders();
  const navigate = useNavigate();

  if (!user) return null;

  const myOrders = getOrdersByCustomer(user.id);
  const pending = myOrders.filter(o => o.status === 'pending').length;
  const approved = myOrders.filter(o => o.status === 'approved').length;
  const rejected = myOrders.filter(o => o.status === 'rejected').length;
  const completed = myOrders.filter(o => o.status === 'completed').length;
  const recentOrders = myOrders.slice(0, 3);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome, {user.name}</h1>
          <p className="text-muted">{user.companyName} — Fuel Ordering Portal</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/new-order')}>
          <PlusCircle size={18} />
          New Fuel Order
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue"><ClipboardList size={22} /></div>
          <div className="stat-content">
            <span className="stat-value">{myOrders.length}</span>
            <span className="stat-label">Total Orders</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow"><Clock size={22} /></div>
          <div className="stat-content">
            <span className="stat-value">{pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green"><CheckCircle2 size={22} /></div>
          <div className="stat-content">
            <span className="stat-value">{approved}</span>
            <span className="stat-label">Approved (OTP Active)</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-red"><XCircle size={22} /></div>
          <div className="stat-content">
            <span className="stat-value">{rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple"><TrendingUp size={22} /></div>
          <div className="stat-content">
            <span className="stat-value">{completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard/orders')}>
            View All →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} />
            <p>No orders yet. Place your first fuel order!</p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/new-order')}>
              <PlusCircle size={18} />
              Place Order
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {recentOrders.map(order => (
              <OrderCard key={order.id} order={order} showOtp />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import OrderCard from '../components/OrderCard';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function StationPendingPage() {
  const { user } = useAuth();
  const { getOrdersBySite, approveOrder, rejectOrder } = useOrders();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!user || !user.siteId) return null;

  const siteOrders = getOrdersBySite(user.siteId);
  const pendingOrders = siteOrders.filter(o => o.status === 'pending');

  const handleApprove = (orderId: string) => {
    approveOrder(orderId, user.id);
  };

  const handleReject = (orderId: string) => {
    if (!rejectReason.trim()) return;
    rejectOrder(orderId, rejectReason.trim());
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Pending Fuel Orders</h1>
          <p className="text-muted">
            Site: {user.siteId} — {pendingOrders.length} orders awaiting approval
          </p>
        </div>
        <div className="stat-badge-inline">
          <Clock size={18} />
          <span>{pendingOrders.length} Pending</span>
        </div>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="empty-state">
          <CheckCircle2 size={48} />
          <h3>All Clear!</h3>
          <p>No pending orders to review.</p>
        </div>
      ) : (
        <div className="orders-list">
          {pendingOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              showOtp
              actions={
                <div className="manager-actions">
                  {rejectingId === order.id ? (
                    <div className="reject-form">
                      <AlertTriangle size={16} className="text-warning" />
                      <input
                        type="text"
                        placeholder="Enter rejection reason..."
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        autoFocus
                      />
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleReject(order.id)}
                        disabled={!rejectReason.trim()}
                      >
                        Confirm Reject
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => { setRejectingId(null); setRejectReason(''); }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="btn btn-success"
                        onClick={() => handleApprove(order.id)}
                      >
                        <CheckCircle2 size={18} />
                        Approve & Activate OTP
                      </button>
                      <button
                        className="btn btn-danger-outline"
                        onClick={() => setRejectingId(order.id)}
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

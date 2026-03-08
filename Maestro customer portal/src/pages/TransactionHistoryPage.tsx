import { History } from 'lucide-react';

export default function TransactionHistoryPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Transaction History</h1>
          <p className="text-muted">View your past transactions</p>
        </div>
      </div>

      <div className="empty-state">
        <History size={48} />
        <h3>No Transaction History</h3>
        <p>Your transaction history will appear here.</p>
      </div>
    </div>
  );
}

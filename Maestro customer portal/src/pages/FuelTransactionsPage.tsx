import { Fuel } from 'lucide-react';

export default function FuelTransactionsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Fuel Transactions</h1>
          <p className="text-muted">View all fuel transactions</p>
        </div>
      </div>

      <div className="empty-state">
        <Fuel size={48} />
        <h3>No Fuel Transactions</h3>
        <p>Your fuel transactions will appear here.</p>
      </div>
    </div>
  );
}

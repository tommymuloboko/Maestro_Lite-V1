import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Fuel,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  LogOut,
  Shield,
  ChevronRight,
  ChevronDown,
  User,
  Settings,
  Truck,
  Car,
  Users,
  Gauge,
  UserCheck,
  FileBarChart,
  ArrowLeftRight,
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mgmtOpen, setMgmtOpen] = useState(() => location.pathname.includes('/management/'));
  const [transactionsOpen, setTransactionsOpen] = useState(() => location.pathname.includes('/transactions/'));
  const [reportsOpen, setReportsOpen] = useState(() => location.pathname.includes('/station/reports/'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isManager = user?.role === 'station_manager';

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-top">
          {/* Brand */}
          <div className="sidebar-brand" onClick={() => navigate(isManager ? '/station' : '/dashboard')}>
            <div className="sidebar-logo">
              <Fuel size={22} />
            </div>
            <span className="sidebar-brand-text">Maestro Fuel</span>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            <span className="sidebar-section-label">Menu</span>

            {isManager ? (
              <>
                <NavLink to="/station" end className="sidebar-link">
                  <LayoutDashboard size={18} />
                  <span>Pending Orders</span>
                  <ChevronRight size={14} className="sidebar-link-arrow" />
                </NavLink>
                <NavLink to="/station/all" className="sidebar-link">
                  <ClipboardList size={18} />
                  <span>All Orders</span>
                  <ChevronRight size={14} className="sidebar-link-arrow" />
                </NavLink>
                <NavLink to="/station/pump-simulator" className="sidebar-link">
                  <Gauge size={18} />
                  <span>Pump Simulator</span>
                  <ChevronRight size={14} className="sidebar-link-arrow" />
                </NavLink>
                <NavLink to="/station/attendants" className="sidebar-link">
                  <UserCheck size={18} />
                  <span>Attendants</span>
                  <ChevronRight size={14} className="sidebar-link-arrow" />
                </NavLink>

                <button
                  className={`sidebar-link sidebar-dropdown-toggle${reportsOpen ? ' open' : ''}`}
                  onClick={() => setReportsOpen(o => !o)}
                >
                  <FileBarChart size={18} />
                  <span>Reports</span>
                  <ChevronDown size={14} className={`sidebar-dropdown-arrow${reportsOpen ? ' rotated' : ''}`} />
                </button>
                {reportsOpen && (
                  <div className="sidebar-dropdown-items">
                    <NavLink to="/station/reports/by-attendant" className="sidebar-link sidebar-sub-link">
                      <span>By Attendants</span>
                      <ChevronRight size={14} className="sidebar-link-arrow" />
                    </NavLink>
                    <NavLink to="/station/reports/by-vehicle" className="sidebar-link sidebar-sub-link">
                      <span>By Vehicle</span>
                      <ChevronRight size={14} className="sidebar-link-arrow" />
                    </NavLink>
                    <NavLink to="/station/reports/by-pump" className="sidebar-link sidebar-sub-link">
                      <span>By Pump</span>
                      <ChevronRight size={14} className="sidebar-link-arrow" />
                    </NavLink>
                    <NavLink to="/station/reports/by-grade" className="sidebar-link sidebar-sub-link">
                      <span>By Grade</span>
                      <ChevronRight size={14} className="sidebar-link-arrow" />
                    </NavLink>
                    <NavLink to="/station/reports/by-customer" className="sidebar-link sidebar-sub-link">
                      <span>By Customer</span>
                      <ChevronRight size={14} className="sidebar-link-arrow" />
                    </NavLink>
                    <NavLink to="/station/reports/statements" className="sidebar-link sidebar-sub-link">
                      <span>Statements</span>
                      <ChevronRight size={14} className="sidebar-link-arrow" />
                    </NavLink>
                  </div>
                )}
              </>
            ) : (
              <>
                <NavLink to="/dashboard" end className="sidebar-link">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                  <ChevronRight size={14} className="sidebar-link-arrow" />
                </NavLink>
                <NavLink to="/dashboard/new-order" className="sidebar-link">
                  <PlusCircle size={18} />
                  <span>New Order</span>
                  <ChevronRight size={14} className="sidebar-link-arrow" />
                </NavLink>
                <NavLink to="/dashboard/orders" className="sidebar-link">
                  <ClipboardList size={18} />
                  <span>My Orders</span>
                  <ChevronRight size={14} className="sidebar-link-arrow" />
                </NavLink>

                <button
                  className={`sidebar-link sidebar-dropdown-toggle${transactionsOpen ? ' open' : ''}`}
                  onClick={() => setTransactionsOpen(o => !o)}
                >
                  <ArrowLeftRight size={18} />
                  <span>Transactions</span>
                  <ChevronDown size={14} className={`sidebar-dropdown-arrow${transactionsOpen ? ' rotated' : ''}`} />
                </button>
                {transactionsOpen && (
                  <div className="sidebar-dropdown-items">
                    <NavLink to="/dashboard/transactions/fuel" className="sidebar-link sidebar-sub-link">
                      <Fuel size={16} />
                      <span>Fuel Transactions</span>
                      <ChevronRight size={14} className="sidebar-link-arrow" />
                    </NavLink>
                  </div>
                )}

                <button
                  className={`sidebar-link sidebar-dropdown-toggle${mgmtOpen ? ' open' : ''}`}
                  onClick={() => setMgmtOpen(o => !o)}
                >
                  <Settings size={18} />
                  <span>Management</span>
                  <ChevronDown size={14} className={`sidebar-dropdown-arrow${mgmtOpen ? ' rotated' : ''}`} />
                </button>
                {mgmtOpen && (
                  <div className="sidebar-dropdown-items">
                    <NavLink to="/dashboard/management/driver" className="sidebar-link sidebar-sub-link">
                      <Truck size={16} />
                      <span>Driver</span>
                      <ChevronRight size={14} className="sidebar-link-arrow" />
                    </NavLink>
                    <NavLink to="/dashboard/management/vehicle" className="sidebar-link sidebar-sub-link">
                      <Car size={16} />
                      <span>Vehicle</span>
                      <ChevronRight size={14} className="sidebar-link-arrow" />
                    </NavLink>
                    <NavLink to="/dashboard/management/users" className="sidebar-link sidebar-sub-link">
                      <Users size={16} />
                      <span>Users</span>
                      <ChevronRight size={14} className="sidebar-link-arrow" />
                    </NavLink>
                  </div>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Bottom / User */}
        <div className="sidebar-bottom">
          {isManager && (
            <div className="sidebar-role-badge">
              <Shield size={14} />
              Station Manager
            </div>
          )}
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              <User size={16} />
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name}</span>
              <span className="sidebar-user-email">{user?.email}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

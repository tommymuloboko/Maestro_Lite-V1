import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import CustomerDashboard from './pages/CustomerDashboard';
import NewOrderPage from './pages/NewOrderPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import StationPendingPage from './pages/StationPendingPage';
import StationAllOrdersPage from './pages/StationAllOrdersPage';
import FuelPumpSimulatorPage from './pages/FuelPumpSimulatorPage';
import AttendantsPage from './pages/AttendantsPage';
import ReportByAttendantPage from './pages/ReportByAttendantPage';
import ReportByVehiclePage from './pages/ReportByVehiclePage';
import ReportByPumpPage from './pages/ReportByPumpPage';
import ReportByGradePage from './pages/ReportByGradePage';
import ReportByCustomerPage from './pages/ReportByCustomerPage';
import StatementsPage from './pages/StatementsPage';
import DriverPage from './pages/DriverPage';
import VehiclePage from './pages/VehiclePage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Customer Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRole="customer">
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CustomerDashboard />} />
              <Route path="new-order" element={<NewOrderPage />} />
              <Route path="orders" element={<CustomerOrdersPage />} />
              <Route path="management/driver" element={<DriverPage />} />
              <Route path="management/vehicle" element={<VehiclePage />} />
              <Route path="management/users" element={<UsersPage />} />
            </Route>

            {/* Station Manager Routes */}
            <Route
              path="/station"
              element={
                <ProtectedRoute allowedRole="station_manager">
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StationPendingPage />} />
              <Route path="all" element={<StationAllOrdersPage />} />
              <Route path="pump-simulator" element={<FuelPumpSimulatorPage />} />
              <Route path="attendants" element={<AttendantsPage />} />
              <Route path="reports/by-attendant" element={<ReportByAttendantPage />} />
              <Route path="reports/by-vehicle" element={<ReportByVehiclePage />} />
              <Route path="reports/by-pump" element={<ReportByPumpPage />} />
              <Route path="reports/by-grade" element={<ReportByGradePage />} />
              <Route path="reports/by-customer" element={<ReportByCustomerPage />} />
              <Route path="reports/statements" element={<StatementsPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </OrderProvider>
    </AuthProvider>
  );
}

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { FuelOrder, NewOrderFormData, OrderStatus, Site } from '../types';

interface OrderContextType {
  orders: FuelOrder[];
  sites: Site[];
  placeOrder: (data: NewOrderFormData, customerId: string, customerName: string) => FuelOrder;
  approveOrder: (orderId: string, managerId: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  completeOrder: (orderId: string) => void;
  validateOtp: (otp: string) => FuelOrder | null;
  startDispensing: (orderId: string) => void;
  getOrdersByCustomer: (customerId: string) => FuelOrder[];
  getOrdersBySite: (siteId: string) => FuelOrder[];
  getOrdersByStatus: (status: OrderStatus) => FuelOrder[];
}

const OrderContext = createContext<OrderContextType | null>(null);

// Demo sites
const DEMO_SITES: Site[] = [
  { id: 'SITE-JHB-001', name: 'Maestro Fuel Depot — Johannesburg', address: '45 Main Reef Rd, Johannesburg', managerId: 'mgr-001' },
  { id: 'SITE-CPT-002', name: 'Maestro Fuel Depot — Cape Town', address: '12 Waterfront Dr, Cape Town', managerId: 'mgr-002' },
  { id: 'SITE-DBN-003', name: 'Maestro Fuel Depot — Durban', address: '88 Point Rd, Durban', managerId: 'mgr-003' },
];

function generateOTP(): string {
  const digits = '0123456789';
  let otp = '';
  const array = new Uint32Array(6);
  crypto.getRandomValues(array);
  for (let i = 0; i < 6; i++) {
    otp += digits[array[i] % 10];
  }
  return otp;
}

function generateOrderId(): string {
  return 'ORD-' + crypto.randomUUID().slice(0, 8).toUpperCase();
}

// Seed some demo orders
const SEED_ORDERS: FuelOrder[] = [
  {
    id: 'ORD-DEMO0001',
    customerId: 'cust-001',
    customerName: 'John Mokoena',
    siteId: 'SITE-JHB-001',
    driverName: 'Sipho Dlamini',
    driverPhone: '+27 82 111 2222',
    vehicleRegNumber: 'GP-123-456',
    vehicleType: 'Truck',
    tankCapacity: 400,
    fuelVolumeAllocated: 350,
    fuelType: 'Diesel',
    otp: '482913',
    otpActive: false,
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-DEMO0002',
    customerId: 'cust-001',
    customerName: 'John Mokoena',
    siteId: 'SITE-JHB-001',
    driverName: 'Thabo Molefe',
    driverPhone: '+27 82 333 4444',
    vehicleRegNumber: 'GP-789-012',
    vehicleType: 'Van',
    tankCapacity: 80,
    fuelVolumeAllocated: 60,
    fuelType: 'Petrol',
    otp: '716205',
    otpActive: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'mgr-001',
  },
  {
    id: 'ORD-DEMO0003',
    customerId: 'cust-001',
    customerName: 'John Mokoena',
    siteId: 'SITE-JHB-001',
    driverName: 'Blessing Nkosi',
    driverPhone: '+27 82 555 6666',
    vehicleRegNumber: 'GP-345-678',
    vehicleType: 'Sedan',
    tankCapacity: 55,
    fuelVolumeAllocated: 40,
    fuelType: 'Petrol',
    otp: '394821',
    otpActive: false,
    status: 'completed',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'mgr-001',
    completedAt: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
  },
];

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<FuelOrder[]>(SEED_ORDERS);

  const placeOrder = useCallback(
    (data: NewOrderFormData, customerId: string, customerName: string): FuelOrder => {
      const newOrder: FuelOrder = {
        id: generateOrderId(),
        customerId,
        customerName,
        siteId: data.siteId,
        driverName: data.driverName,
        driverPhone: data.driverPhone,
        vehicleRegNumber: data.vehicleRegNumber,
        vehicleType: data.vehicleType,
        tankCapacity: data.tankCapacity,
        fuelVolumeAllocated: data.fuelVolumeAllocated,
        fuelType: data.fuelType,
        otp: generateOTP(),
        otpActive: false, // OTP is inactive until station manager approves
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    },
    [],
  );

  const approveOrder = useCallback((orderId: string, managerId: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: 'approved' as OrderStatus,
              otpActive: true,
              approvedAt: new Date().toISOString(),
              approvedBy: managerId,
            }
          : o,
      ),
    );
  }, []);

  const rejectOrder = useCallback((orderId: string, reason: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: 'rejected' as OrderStatus,
              otpActive: false,
              rejectionReason: reason,
            }
          : o,
      ),
    );
  }, []);

  const completeOrder = useCallback((orderId: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: 'completed' as OrderStatus,
              otpActive: false,
              completedAt: new Date().toISOString(),
            }
          : o,
      ),
    );
  }, []);

  const getOrdersByCustomer = useCallback(
    (customerId: string) => orders.filter(o => o.customerId === customerId),
    [orders],
  );

  const getOrdersBySite = useCallback(
    (siteId: string) => orders.filter(o => o.siteId === siteId),
    [orders],
  );

  const getOrdersByStatus = useCallback(
    (status: OrderStatus) => orders.filter(o => o.status === status),
    [orders],
  );

  const validateOtp = useCallback(
    (otp: string): FuelOrder | null => {
      return orders.find(o => o.otp === otp && o.otpActive && o.status === 'approved') ?? null;
    },
    [orders],
  );

  const startDispensing = useCallback((orderId: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, status: 'dispensing' as OrderStatus }
          : o,
      ),
    );
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        sites: DEMO_SITES,
        placeOrder,
        approveOrder,
        rejectOrder,
        completeOrder,
        validateOtp,
        startDispensing,
        getOrdersByCustomer,
        getOrdersBySite,
        getOrdersByStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders(): OrderContextType {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}

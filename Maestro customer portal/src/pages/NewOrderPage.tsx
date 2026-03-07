import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import type { NewOrderFormData, VehicleType, FuelType } from '../types';
import {
  Send,
  Fuel,
  MapPin,
  User,
  Phone,
  Car,
  Hash,
  Truck,
  Droplets,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';

const VEHICLE_TYPES: VehicleType[] = [
  'Sedan', 'SUV', 'Truck', 'Bus', 'Motorcycle', 'Van', 'Tanker', 'Pickup', 'Other',
];

const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'Kerosene', 'LPG'];

export default function NewOrderPage() {
  const { user } = useAuth();
  const { placeOrder, sites } = useOrders();
  const navigate = useNavigate();

  const [form, setForm] = useState<NewOrderFormData>({
    siteId: '',
    driverName: '',
    driverPhone: '',
    vehicleRegNumber: '',
    vehicleType: 'Truck',
    tankCapacity: 0,
    fuelVolumeAllocated: 0,
    fuelType: 'Diesel',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof NewOrderFormData, string>>>({});
  const [submitted, setSubmitted] = useState<{ orderId: string; otp: string } | null>(null);

  if (!user) return null;

  const updateField = <K extends keyof NewOrderFormData>(key: K, value: NewOrderFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NewOrderFormData, string>> = {};

    if (!form.siteId) newErrors.siteId = 'Please select a site';
    if (!form.driverName.trim()) newErrors.driverName = 'Driver name is required';
    if (!form.driverPhone.trim()) newErrors.driverPhone = 'Driver phone is required';
    if (!form.vehicleRegNumber.trim()) newErrors.vehicleRegNumber = 'Vehicle registration is required';
    if (form.tankCapacity <= 0) newErrors.tankCapacity = 'Tank capacity must be greater than 0';
    if (form.fuelVolumeAllocated <= 0) newErrors.fuelVolumeAllocated = 'Volume must be greater than 0';
    if (form.fuelVolumeAllocated > form.tankCapacity) {
      newErrors.fuelVolumeAllocated = 'Volume cannot exceed tank capacity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const order = placeOrder(form, user.id, user.name);
    setSubmitted({ orderId: order.id, otp: order.otp });
  };

  if (submitted) {
    return (
      <div className="page">
        <div className="success-card">
          <CheckCircle2 size={56} className="success-icon" />
          <h2>Order Submitted Successfully!</h2>
          <p className="text-muted">
            Your fuel order has been sent to the station for approval.
          </p>

          <div className="otp-display">
            <KeyRound size={24} />
            <div>
              <span className="otp-display-label">OTP Generated for Driver</span>
              <span className="otp-display-value">{submitted.otp}</span>
            </div>
          </div>

          <div className="info-box">
            <p><strong>Order ID:</strong> {submitted.orderId}</p>
            <p>The OTP will be sent to the driver's mobile app.</p>
            <p>It will be <strong>activated</strong> once the station manager approves the order.</p>
          </div>

          <div className="action-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/orders')}>
              <Fuel size={18} />
              View My Orders
            </button>
            <button className="btn btn-outline" onClick={() => { setSubmitted(null); setForm({ siteId: '', driverName: '', driverPhone: '', vehicleRegNumber: '', vehicleType: 'Truck', tankCapacity: 0, fuelVolumeAllocated: 0, fuelType: 'Diesel' }); }}>
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1>New Fuel Order</h1>
          <p className="text-muted">Request fuel for a vehicle</p>
        </div>
      </div>

      <form className="order-form" onSubmit={handleSubmit}>
        {/* Site Selection */}
        <div className="form-section">
          <h3><MapPin size={18} /> Station Site</h3>
          <div className="form-group">
            <label htmlFor="siteId">Select Fuel Station</label>
            <select
              id="siteId"
              value={form.siteId}
              onChange={e => updateField('siteId', e.target.value)}
              className={errors.siteId ? 'input-error' : ''}
            >
              <option value="">-- Select a station --</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
              ))}
            </select>
            {errors.siteId && <span className="field-error">{errors.siteId}</span>}
          </div>
        </div>

        {/* Driver Info */}
        <div className="form-section">
          <h3><User size={18} /> Driver Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="driverName">Driver Name</label>
              <input
                id="driverName"
                type="text"
                value={form.driverName}
                onChange={e => updateField('driverName', e.target.value)}
                placeholder="Enter driver's full name"
                className={errors.driverName ? 'input-error' : ''}
              />
              {errors.driverName && <span className="field-error">{errors.driverName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="driverPhone"><Phone size={14} /> Driver Mobile Number</label>
              <input
                id="driverPhone"
                type="tel"
                value={form.driverPhone}
                onChange={e => updateField('driverPhone', e.target.value)}
                placeholder="+27 82 000 0000"
                className={errors.driverPhone ? 'input-error' : ''}
              />
              {errors.driverPhone && <span className="field-error">{errors.driverPhone}</span>}
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="form-section">
          <h3><Car size={18} /> Vehicle Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicleRegNumber"><Hash size={14} /> Vehicle Reg Number</label>
              <input
                id="vehicleRegNumber"
                type="text"
                value={form.vehicleRegNumber}
                onChange={e => updateField('vehicleRegNumber', e.target.value.toUpperCase())}
                placeholder="e.g. GP-123-456"
                className={errors.vehicleRegNumber ? 'input-error' : ''}
              />
              {errors.vehicleRegNumber && <span className="field-error">{errors.vehicleRegNumber}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="vehicleType">Vehicle Type</label>
              <select
                id="vehicleType"
                value={form.vehicleType}
                onChange={e => updateField('vehicleType', e.target.value as VehicleType)}
              >
                {VEHICLE_TYPES.map(vt => (
                  <option key={vt} value={vt}>{vt}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="tankCapacity"><Truck size={14} /> Tank Capacity (Litres)</label>
            <input
              id="tankCapacity"
              type="number"
              min={1}
              value={form.tankCapacity || ''}
              onChange={e => updateField('tankCapacity', Number(e.target.value))}
              placeholder="Enter tank capacity in litres"
              className={errors.tankCapacity ? 'input-error' : ''}
            />
            {errors.tankCapacity && <span className="field-error">{errors.tankCapacity}</span>}
          </div>
        </div>

        {/* Fuel Info */}
        <div className="form-section">
          <h3><Fuel size={18} /> Fuel Request</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fuelType">Fuel Type</label>
              <select
                id="fuelType"
                value={form.fuelType}
                onChange={e => updateField('fuelType', e.target.value as FuelType)}
              >
                {FUEL_TYPES.map(ft => (
                  <option key={ft} value={ft}>{ft}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="fuelVolumeAllocated"><Droplets size={14} /> Fuel Volume Allocated (Litres)</label>
              <input
                id="fuelVolumeAllocated"
                type="number"
                min={1}
                max={form.tankCapacity || undefined}
                value={form.fuelVolumeAllocated || ''}
                onChange={e => updateField('fuelVolumeAllocated', Number(e.target.value))}
                placeholder="Enter fuel volume in litres"
                className={errors.fuelVolumeAllocated ? 'input-error' : ''}
              />
              {errors.fuelVolumeAllocated && <span className="field-error">{errors.fuelVolumeAllocated}</span>}
            </div>
          </div>
          {form.tankCapacity > 0 && form.fuelVolumeAllocated > 0 && (
            <div className="fill-indicator">
              <div className="fill-bar">
                <div
                  className="fill-level"
                  style={{ width: `${Math.min((form.fuelVolumeAllocated / form.tankCapacity) * 100, 100)}%` }}
                />
              </div>
              <span>{Math.round((form.fuelVolumeAllocated / form.tankCapacity) * 100)}% of tank capacity</span>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg">
          <Send size={20} />
          Submit Fuel Order
        </button>
      </form>
    </div>
  );
}

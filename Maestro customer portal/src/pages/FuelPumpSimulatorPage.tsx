import { useState, useEffect, useRef } from 'react';
import { useOrders } from '../context/OrderContext';
import type { FuelOrder } from '../types';
import { Fuel, ShieldCheck, AlertTriangle, Droplets } from 'lucide-react';

type PumpState = 'idle' | 'validating' | 'authorized' | 'dispensing' | 'complete' | 'error';

export default function FuelPumpSimulatorPage() {
  const { validateOtp, startDispensing, completeOrder } = useOrders();

  const [otpInput, setOtpInput] = useState('');
  const [pumpState, setPumpState] = useState<PumpState>('idle');
  const [order, setOrder] = useState<FuelOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [dispensed, setDispensed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleVerify = () => {
    if (otpInput.length !== 6) {
      setErrorMsg('OTP must be 6 digits.');
      setPumpState('error');
      return;
    }

    setPumpState('validating');

    // Simulate DB query delay
    setTimeout(() => {
      const found = validateOtp(otpInput);
      if (found) {
        setOrder(found);
        setPumpState('authorized');
        setErrorMsg('');
      } else {
        setOrder(null);
        setErrorMsg('Invalid or inactive OTP. Refueling denied.');
        setPumpState('error');
      }
    }, 1200);
  };

  const handleStartPump = () => {
    if (!order) return;
    startDispensing(order.id);
    setPumpState('dispensing');
    setDispensed(0);

    const target = order.fuelVolumeAllocated;
    const increment = target / 40; // ~40 ticks to fill

    intervalRef.current = setInterval(() => {
      setDispensed(prev => {
        const next = prev + increment + (Math.random() * increment * 0.3);
        if (next >= target) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          completeOrder(order.id);
          setPumpState('complete');
          return target;
        }
        return next;
      });
    }, 200);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setOtpInput('');
    setPumpState('idle');
    setOrder(null);
    setErrorMsg('');
    setDispensed(0);
  };

  const pctFilled = order ? Math.min((dispensed / order.fuelVolumeAllocated) * 100, 100) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Fuel Pump Simulator</h1>
          <p className="text-muted">Enter an OTP to authorize and simulate refueling</p>
        </div>
      </div>

      <div className="pump-simulator">
        {/* Pump display */}
        <div className="pump-display">
          <div className="pump-icon-ring">
            <Fuel size={40} />
          </div>
          <div className={`pump-status-light pump-status-${pumpState}`} />
          <span className="pump-state-label">
            {pumpState === 'idle' && 'Awaiting OTP'}
            {pumpState === 'validating' && 'Querying Orders DB…'}
            {pumpState === 'authorized' && 'OTP Verified — Ready'}
            {pumpState === 'dispensing' && 'Dispensing Fuel…'}
            {pumpState === 'complete' && 'Refueling Complete'}
            {pumpState === 'error' && 'Authorization Failed'}
          </span>
        </div>

        {/* OTP entry */}
        {(pumpState === 'idle' || pumpState === 'error' || pumpState === 'validating') && (
          <div className="pump-otp-section">
            <label className="pump-label">Enter 6-digit OTP</label>
            <div className="pump-otp-row">
              <input
                className="pump-otp-input"
                type="text"
                maxLength={6}
                placeholder="● ● ● ● ● ●"
                value={otpInput}
                onChange={e => {
                  setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (pumpState === 'error') setPumpState('idle');
                }}
                onKeyDown={e => { if (e.key === 'Enter') handleVerify(); }}
                disabled={pumpState === 'validating'}
              />
              <button
                className="btn btn-primary btn-lg"
                onClick={handleVerify}
                disabled={pumpState === 'validating' || otpInput.length < 6}
              >
                {pumpState === 'validating' ? 'Verifying…' : 'Verify OTP'}
              </button>
            </div>
            {pumpState === 'error' && (
              <div className="pump-error">
                <AlertTriangle size={16} />
                {errorMsg}
              </div>
            )}
          </div>
        )}

        {/* Authorized — show order details */}
        {pumpState === 'authorized' && order && (
          <div className="pump-authorized">
            <div className="pump-auth-banner">
              <ShieldCheck size={22} />
              <span>OTP Verified — Refueling Authorized</span>
            </div>
            <div className="pump-order-details">
              <div className="pump-detail"><span>Order</span><strong>{order.id}</strong></div>
              <div className="pump-detail"><span>Driver</span><strong>{order.driverName}</strong></div>
              <div className="pump-detail"><span>Vehicle</span><strong>{order.vehicleRegNumber}</strong></div>
              <div className="pump-detail"><span>Fuel Type</span><strong>{order.fuelType}</strong></div>
              <div className="pump-detail"><span>Allocated</span><strong>{order.fuelVolumeAllocated} L</strong></div>
            </div>
            <button className="btn btn-success btn-lg pump-start-btn" onClick={handleStartPump}>
              <Droplets size={18} />
              Start Pump
            </button>
          </div>
        )}

        {/* Dispensing animation */}
        {(pumpState === 'dispensing' || pumpState === 'complete') && order && (
          <div className="pump-dispensing-section">
            <div className="pump-gauge">
              <div className="pump-gauge-fill" style={{ height: `${pctFilled}%` }} />
              <div className="pump-gauge-label">
                <span className="pump-gauge-litres">{dispensed.toFixed(1)} L</span>
                <span className="pump-gauge-pct">{pctFilled.toFixed(0)}%</span>
              </div>
            </div>
            <div className="pump-dispensing-info">
              <div className="pump-detail"><span>Fuel Type</span><strong>{order.fuelType}</strong></div>
              <div className="pump-detail"><span>Target</span><strong>{order.fuelVolumeAllocated} L</strong></div>
              <div className="pump-detail"><span>Dispensed</span><strong>{dispensed.toFixed(1)} L</strong></div>
              <div className="pump-detail"><span>Vehicle</span><strong>{order.vehicleRegNumber}</strong></div>
            </div>
            {pumpState === 'complete' && (
              <div className="pump-complete-banner">
                <ShieldCheck size={20} />
                Refueling complete — {order.fuelVolumeAllocated} L dispensed. OTP deactivated.
              </div>
            )}
            <button className="btn btn-outline pump-reset-btn" onClick={handleReset}>
              {pumpState === 'complete' ? 'New Transaction' : 'Cancel'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

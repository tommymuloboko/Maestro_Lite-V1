import { useState } from 'react';
import { Plus, Search, Car, Pencil, Trash2, Check, X } from 'lucide-react';

interface Vehicle {
  vehicle_id: string;
  license_plate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  fuel_type: string;
  tank_capacity: number;
  current_fuel_level: number;
  average_mpg: number;
  driver_id: string;
  location_lat: number;
  location_long: number;
  last_serviced_date: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
}

const MOCK_VEHICLES: Vehicle[] = [
  {
    vehicle_id: 'VH-001',
    license_plate: 'ABC-1234',
    vin: '1HGBH41JXMN109186',
    make: 'Ford',
    model: 'Transit',
    year: 2023,
    fuel_type: 'Diesel',
    tank_capacity: 80,
    current_fuel_level: 45.5,
    average_mpg: 28.3,
    driver_id: 'DRV-001',
    location_lat: -26.2041,
    location_long: 28.0473,
    last_serviced_date: '2026-01-15',
    status: 'Active',
  },
  {
    vehicle_id: 'VH-002',
    license_plate: 'XYZ-5678',
    vin: '2FMDK3GC4BBA12345',
    make: 'Volvo',
    model: 'FH16',
    year: 2022,
    fuel_type: 'Diesel',
    tank_capacity: 120,
    current_fuel_level: 90.0,
    average_mpg: 22.1,
    driver_id: 'DRV-002',
    location_lat: -25.7479,
    location_long: 28.2293,
    last_serviced_date: '2026-02-20',
    status: 'Active',
  },
  {
    vehicle_id: 'VH-003',
    license_plate: 'DEF-9012',
    vin: '3GNDA13D76S000000',
    make: 'Toyota',
    model: 'Hilux',
    year: 2024,
    fuel_type: 'Petrol',
    tank_capacity: 65,
    current_fuel_level: 12.0,
    average_mpg: 32.5,
    driver_id: 'DRV-003',
    location_lat: -33.9249,
    location_long: 18.4241,
    last_serviced_date: '2025-11-05',
    status: 'Maintenance',
  },
  {
    vehicle_id: 'VH-004',
    license_plate: 'GHI-3456',
    vin: '5YJSA1DN5DFP00001',
    make: 'Tesla',
    model: 'Semi',
    year: 2025,
    fuel_type: 'EV',
    tank_capacity: 0,
    current_fuel_level: 0,
    average_mpg: 0,
    driver_id: '',
    location_lat: -29.8587,
    location_long: 31.0218,
    last_serviced_date: '2026-03-01',
    status: 'Inactive',
  },
];

const STATUS_FILTERS = ['All', 'Active', 'Inactive', 'Maintenance'] as const;

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Vehicle | null>(null);

  const handleDelete = (id: string) => {
    setVehicles(prev => prev.filter(v => v.vehicle_id !== id));
  };

  const handleEdit = (v: Vehicle) => {
    setEditingId(v.vehicle_id);
    setEditData({ ...v });
  };

  const handleEditChange = (field: keyof Vehicle, value: string | number) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const handleSave = () => {
    if (!editData) return;
    setVehicles(prev => prev.map(v => v.vehicle_id === editData.vehicle_id ? editData : v));
    setEditingId(null);
    setEditData(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  const filtered = vehicles.filter(v => {
    const matchesSearch =
      search === '' ||
      v.license_plate.toLowerCase().includes(search.toLowerCase()) ||
      v.vin.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page page-wide">
      <div className="page-header">
        <div>
          <h1>Vehicle Management</h1>
          <p className="text-muted">{vehicles.length} vehicles registered</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          Add Vehicle
        </button>
      </div>

      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="table-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search plate, VIN, make or model…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-bar">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              className={`filter-btn${statusFilter === f ? ' active' : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Car size={48} />
          <p>No vehicles found.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>License Plate</th>
                <th>VIN</th>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>Fuel Type</th>
                <th>Tank Cap.</th>
                <th>Fuel Level</th>
                <th>Avg MPG</th>
                <th>Driver</th>
                <th>Last Serviced</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const isEditing = editingId === v.vehicle_id;
                const row = isEditing && editData ? editData : v;
                return (
                  <tr key={v.vehicle_id}>
                    <td className="cell-bold">
                      {isEditing ? <input className="cell-input" value={row.license_plate} onChange={e => handleEditChange('license_plate', e.target.value)} /> : row.license_plate}
                    </td>
                    <td className="cell-mono">
                      {isEditing ? <input className="cell-input" value={row.vin} onChange={e => handleEditChange('vin', e.target.value)} /> : row.vin}
                    </td>
                    <td>{isEditing ? <input className="cell-input" value={row.make} onChange={e => handleEditChange('make', e.target.value)} /> : row.make}</td>
                    <td>{isEditing ? <input className="cell-input" value={row.model} onChange={e => handleEditChange('model', e.target.value)} /> : row.model}</td>
                    <td>{isEditing ? <input className="cell-input cell-input-sm" type="number" value={row.year} onChange={e => handleEditChange('year', Number(e.target.value))} /> : row.year}</td>
                    <td>
                      {isEditing ? (
                        <select className="cell-input" value={row.fuel_type} onChange={e => handleEditChange('fuel_type', e.target.value)}>
                          <option>Diesel</option><option>Petrol</option><option>EV</option><option>CNG</option>
                        </select>
                      ) : (
                        <span className={`fuel-badge fuel-${row.fuel_type.toLowerCase()}`}>{row.fuel_type}</span>
                      )}
                    </td>
                    <td>{isEditing ? <input className="cell-input cell-input-sm" type="number" value={row.tank_capacity} onChange={e => handleEditChange('tank_capacity', Number(e.target.value))} /> : row.tank_capacity > 0 ? `${row.tank_capacity} L` : '—'}</td>
                    <td>{isEditing ? <input className="cell-input cell-input-sm" type="number" value={row.current_fuel_level} onChange={e => handleEditChange('current_fuel_level', Number(e.target.value))} /> : row.current_fuel_level > 0 ? `${row.current_fuel_level} L` : '—'}</td>
                    <td>{isEditing ? <input className="cell-input cell-input-sm" type="number" value={row.average_mpg} onChange={e => handleEditChange('average_mpg', Number(e.target.value))} /> : row.average_mpg > 0 ? row.average_mpg : '—'}</td>
                    <td>{isEditing ? <input className="cell-input" value={row.driver_id} onChange={e => handleEditChange('driver_id', e.target.value)} /> : row.driver_id || '—'}</td>
                    <td>{isEditing ? <input className="cell-input" type="date" value={row.last_serviced_date} onChange={e => handleEditChange('last_serviced_date', e.target.value)} /> : row.last_serviced_date}</td>
                    <td>
                      {isEditing ? (
                        <select className="cell-input" value={row.status} onChange={e => handleEditChange('status', e.target.value)}>
                          <option>Active</option><option>Inactive</option><option>Maintenance</option>
                        </select>
                      ) : (
                        <span className={`status-badge status-${row.status.toLowerCase()}`}>{row.status}</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        {isEditing ? (
                          <>
                            <button className="action-btn action-save" title="Save" onClick={handleSave}><Check size={15} /></button>
                            <button className="action-btn action-cancel" title="Cancel" onClick={handleCancel}><X size={15} /></button>
                          </>
                        ) : (
                          <>
                            <button className="action-btn action-edit" title="Edit" onClick={() => handleEdit(v)}><Pencil size={15} /></button>
                            <button className="action-btn action-delete" title="Delete" onClick={() => handleDelete(v.vehicle_id)}><Trash2 size={15} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

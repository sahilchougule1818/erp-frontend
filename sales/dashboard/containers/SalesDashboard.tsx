import { Package, ArrowUp } from 'lucide-react';
import { DataTable } from '../../../shared/components/DataTable';
import { useIndoorStock, useOutdoorStock, useDashboardStats } from '../../hooks/useSalesApi';

// ─── Stat card ────────────────────────────────────────────────────────────────

type StatCardProps = {
  label: string;
  value: string;
  sub: string;
  bg: string;
  border: string;
  labelColor: string;
  valueColor: string;
  subColor: string;
  icon: React.ReactNode;
};

function StatCard({ label, value, sub, bg, border, labelColor, valueColor, subColor, icon }: StatCardProps) {
  return (
    <div style={{ padding: '20px', backgroundColor: bg, borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1rem', fontWeight: '600', color: labelColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        {icon}
      </div>
      <div style={{ fontSize: '1.875rem', fontWeight: '700', color: valueColor, marginTop: '8px' }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: subColor, fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>{sub}</div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em' }}>{title}</h2>
      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{sub}</p>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function SalesDashboard() {
  const { stock: indoorStock } = useIndoorStock();
  const { stock: outdoorStock } = useOutdoorStock();
  const { stats } = useDashboardStats();

  const totalIndoorBottles = Number(stats?.total_indoor_bottles) || 0;
  const totalOutdoorPlants = Number(stats?.total_outdoor_plants) || 0;

  // ── Columns ──────────────────────────────────────────────────────────────

  const indoorColumns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'stage', label: 'Stage' },
    { key: 'phase', label: 'Phase' },
    { key: 'lab_number', label: 'Lab' },
    { key: 'available_bottles', label: 'Available Plants', render: (val: number) => Number(val).toLocaleString() }
  ];

  const outdoorColumns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant' },
    { key: 'phase', label: 'Phase' },
    { key: 'location', label: 'Location' },
    { key: 'available_plants', label: 'Available Plants', render: (val: number) => Number(val).toLocaleString() }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* KPI Cards — 2 in one row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <StatCard
          label="Indoor Stock"
          value={totalIndoorBottles.toLocaleString()}
          sub="Available Bottles (Incubation)"
          bg="#E6F1FB" border="" labelColor="#185FA5" valueColor="#0C447C" subColor="#185FA5"
          icon={<ArrowUp style={{ color: '#185FA5', width: '20px', height: '20px' }} />}
        />
        <StatCard
          label="Outdoor Stock"
          value={totalOutdoorPlants.toLocaleString()}
          sub="Available Plants (Outdoor)"
          bg="#EAF3DE" border="" labelColor="#3B6D11" valueColor="#27500A" subColor="#3B6D11"
          icon={<Package style={{ color: '#3B6D11', width: '20px', height: '20px' }} />}
        />
      </div>

      {/* ── STOCK ANALYSIS ── */}
      <div>
        <SectionHeader
          title="Stock Analysis"
          sub="Current batches across indoor incubation and outdoor holding areas"
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', minWidth: 0 }}>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <DataTable
              title="Indoor Stock (Incubation)"
              columns={indoorColumns}
              records={indoorStock}
              exportFileName="indoor_stock"
            />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <DataTable
              title="Outdoor Stock (Holding)"
              columns={outdoorColumns}
              records={outdoorStock}
              exportFileName="outdoor_stock"
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default SalesDashboard;

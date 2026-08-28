import { useState, useEffect, memo, useCallback } from 'react';
import { Leaf, TreePine, Warehouse, Skull } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { outdoorApi } from '../../services/outdoorApi';

const UNITS = [
  { name: 'Unit A', prefix: 'A', tunnels: 10 },
  { name: 'Unit B', prefix: 'B', tunnels: 10 },
  { name: 'Unit C', prefix: 'C', tunnels: 10 },
  { name: 'Unit D', prefix: 'D', tunnels: 10 },
  { name: 'Unit E', prefix: 'E', tunnels: 10 }
];

const COLORS_HEX = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

type ViewMode = 'primary' | 'secondary' | 'holding';

export const OutdoorDashboard = memo(() => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [occupancy, setOccupancy] = useState<any[]>([]);
  const [shOccupancy, setSHOccupancy] = useState<any[]>([]);
  const [holdingBatches, setHoldingBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTunnel, setExpandedTunnel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('primary');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, occupancyData, shOccupancyData, holdingData] = await Promise.all([
          outdoorApi.dashboard.getDashboardStats(),
          outdoorApi.dashboard.getTunnelOccupancy(),
          outdoorApi.dashboard.getSHOccupancy(),
          outdoorApi.dashboard.getHoldingArea()
        ]);
        setStats(statsData);
        setOccupancy(occupancyData);
        setSHOccupancy(shOccupancyData);
        setHoldingBatches(holdingData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTunnelData = useCallback((tunnelName: string) => {
    return viewMode === 'secondary' 
      ? shOccupancy.find(o => o.name === tunnelName)
      : occupancy.find(o => o.name === tunnelName);
  }, [occupancy, shOccupancy, viewMode]);

  const renderOccupancyBar = (tunnelName: string) => {
    const data = getTunnelData(tunnelName);
    const batches = data?.batches || [];
    const totalPlants = batches.reduce((sum: number, b: any) => sum + (b.available_plants || 0), 0);
    const capacity = data?.capacity || 0;
    const isOverCapacity = capacity > 0 && totalPlants > capacity;
    const isExpanded = expandedTunnel === tunnelName;

    return (
      <div key={tunnelName}>
        {/* Summary Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 100px',
            padding: '12px 0',
            borderBottom: '1px solid #f1f5f9',
            cursor: 'pointer',
            backgroundColor: isExpanded ? '#f8fafc' : 'transparent',
            transition: 'background 0.2s'
          }}
          onClick={() => setExpandedTunnel(isExpanded ? null : tunnelName)}
        >
          {/* 1. Tunnel ID + overflow warning */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontWeight: '600', color: isOverCapacity ? '#ef4444' : '#64748b' }}>{tunnelName}</span>
            {isOverCapacity && <span style={{ fontSize: '0.55rem', fontWeight: '700', color: '#ef4444', lineHeight: 1, whiteSpace: 'nowrap' }}>OVERCROWDED</span>}
          </div>

          {/* 2. Occupancy & Batch Count */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>
                {batches.length > 1 ? `${batches.length} Batches` : (batches.length === 1 ? '1 Batch' : '')}
              </span>
              {batches.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>Active</span>
              )}
            </div>
            
            {/* Stacked progress bar — vs capacity if set, else proportional among batches */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
              {batches.length > 0 ? (
                batches.map((batch: any, idx: number) => {
                  const base = capacity > 0 ? capacity : totalPlants;
                  const pct = base > 0 ? Math.min((batch.available_plants / base) * 100, 100) : 0;
                  const color = COLORS_HEX[idx % COLORS_HEX.length];
                  return (
                    <div
                      key={idx}
                      style={{ width: `${pct}%`, height: '100%', backgroundColor: color, transition: 'width 0.3s ease' }}
                      title={`${batch.batch_code}: ${batch.available_plants} plants`}
                    />
                  );
                })
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#e2e8f0' }} />
              )}
            </div>
          </div>

          {/* 3. Plant count vs capacity */}
          <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 'bold', color: isOverCapacity ? '#ef4444' : '#0f172a' }}>
              {totalPlants > 0 ? totalPlants.toLocaleString() : '—'}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
              {capacity > 0 ? `/ ${capacity.toLocaleString()}` : 'plants'}
            </div>
          </div>
        </div>

        {/* Expanded Detail View */}
        {isExpanded && batches.length > 0 && (
          <div style={{ backgroundColor: '#f8fafc', padding: '12px 12px 12px 40px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {batches.map((batch: any, idx: number) => {
              const color = COLORS_HEX[idx % COLORS_HEX.length];
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    borderLeft: `4px solid ${color}`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px', padding: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>
                        {batch.batch_code}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {batch.plant_name}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>
                        {batch.available_plants}
                      </div>
                      {batch.total_mortality > 0 && (
                        <div style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.7rem' }}>
                          ⚠ {batch.total_mortality}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderUnitCard = (unit: any) => (
    <div key={unit.prefix} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '6px', height: '20px', backgroundColor: '#10b981', borderRadius: '4px' }} />
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold' }}>{unit.name}</h3>
      </div>
      <div style={{ padding: '0 16px', overflowY: 'auto', maxHeight: '280px', scrollbarWidth: 'thin' }}>
        {Array.from({ length: unit.tunnels }).map((_, idx) => {
          const tunnelName = `${unit.prefix}${idx + 1}`;
          return renderOccupancyBar(tunnelName);
        })}
      </div>
    </div>
  );

  const renderHoldingArea = () => {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #fed7aa', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #ffedd5', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '20px', backgroundColor: '#ea580c', borderRadius: '4px' }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold' }}>Holding Area Stock</h3>
        </div>
        <div style={{ padding: '16px', overflowY: 'auto', maxHeight: '600px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {holdingBatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
              <Warehouse style={{ width: '32px', height: '32px', margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ fontSize: '0.75rem', margin: 0 }}>No batches in holding</p>
            </div>
          ) : (
            holdingBatches.map((batch: any, idx: number) => {
              return (
                <div
                  key={idx}
                  style={{ padding: '12px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', cursor: 'pointer' }}
                  onClick={() => navigate(`/batch-timeline?batch=${batch.batch_code}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{batch.batch_code}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{batch.plant_name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#ea580c' }}>{batch.available_plants}</div>
                      <div style={{ fontSize: '10px', color: '#fb923c', fontWeight: 'bold', textTransform: 'uppercase' }}>Plants</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderSHUnitCard = (unit: any) => (
    <div key={unit.name} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #bfdbfe', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '6px', height: '20px', backgroundColor: '#3b82f6', borderRadius: '4px' }} />
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold' }}>{unit.name}</h3>
      </div>
      <div style={{ padding: '16px' }}>
        {renderOccupancyBar(unit.name)}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* KPI Cards Row */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          <div style={{ padding: '20px', backgroundColor: '#EAF3DE', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#3B6D11', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.2' }}>Primary</span>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#3B6D11', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.2' }}>Hardening</span>
              </div>
              <Leaf style={{ color: '#3B6D11', width: '20px', height: '20px' }} />
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#27500A', marginTop: '8px' }}>{stats?.primary_count || 0}</div>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#E6F1FB', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#185FA5', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.2' }}>Secondary</span>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#185FA5', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.2' }}>Hardening</span>
              </div>
              <TreePine style={{ color: '#185FA5', width: '20px', height: '20px' }} />
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0C447C', marginTop: '8px' }}>{stats?.secondary_count || 0}</div>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#FAEEDA', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.2' }}>Holding</span>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.2' }}>Area</span>
              </div>
              <Warehouse style={{ color: '#854F0B', width: '20px', height: '20px' }} />
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#633806', marginTop: '8px' }}>{holdingBatches.length}</div>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#FCEBEB', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#A32D2D', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.2' }}>Total</span>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#A32D2D', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.2' }}>Mortality</span>
              </div>
              <Skull style={{ color: '#A32D2D', width: '20px', height: '20px' }} />
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#791F1F', marginTop: '8px' }}>{stats?.total_mortality || 0}</div>
          </div>
        </div>
      )}

      {/* Toggle Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setViewMode('primary')}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: viewMode === 'primary' ? '2px solid #10b981' : '1px solid #e2e8f0',
            backgroundColor: viewMode === 'primary' ? '#d1fae5' : 'white',
            color: viewMode === 'primary' ? '#065f46' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Leaf style={{ width: '18px', height: '18px' }} />
          Primary Hardening
        </button>
        <button
          onClick={() => setViewMode('secondary')}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: viewMode === 'secondary' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            backgroundColor: viewMode === 'secondary' ? '#dbeafe' : 'white',
            color: viewMode === 'secondary' ? '#1e40af' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <TreePine style={{ width: '18px', height: '18px' }} />
          Secondary Hardening
        </button>
        <button
          onClick={() => setViewMode('holding')}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: viewMode === 'holding' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
            backgroundColor: viewMode === 'holding' ? '#fef3c7' : 'white',
            color: viewMode === 'holding' ? '#92400e' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Warehouse style={{ width: '18px', height: '18px' }} />
          Holding Area
        </button>
      </div>

      {/* Grid Schematic Layout */}
      {viewMode === 'primary' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px', marginBottom: '40px' }}>
          {UNITS.map((unit) => renderUnitCard(unit))}
        </div>
      )}

      {viewMode === 'secondary' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px', marginBottom: '40px' }}>
          {shOccupancy.map((unit) => renderSHUnitCard(unit))}
        </div>
      )}

      {viewMode === 'holding' && (
        <div style={{ marginBottom: '40px' }}>
          {renderHoldingArea()}
        </div>
      )}
    </div>
  );
});

import { useState } from 'react';
import { useRootingData } from '../hooks/useRootingData';
import { DataTable } from '../../../shared/components/DataTable';

export function RootingManagement() {
  const { rootedBatches, loading, error, pagination } = useRootingData();
  const [showAll, setShowAll] = useState(false);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-IN');
  };

  const columns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'lab_number', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'media_code', label: 'Media Code', render: (v: string) => v || '—' },
    { key: 'qty_in', label: 'Bottles Entered' },
    { key: 'qty_contaminated', label: 'Contamination' },
    { key: 'qty_sold', label: 'Sold' },
    { key: 'qty_available', label: 'Available' },
    { key: 'source_batch_stage', label: 'Source Stage' },
    { key: 'rooting_date', label: 'Rooting Date', render: (value: string | null) => formatDate(value) },
    { key: 'state', label: 'State' },
  ];

  if (loading) return <div className="p-6">Loading rooted batches...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  const activeCount = rootedBatches.filter((b: any) => b.state === 'ACTIVE' || b.state === 'OUTDOOR_READY').length;
  const completedCount = rootedBatches.filter((b: any) => b.state === 'SOLD_OUT' || b.state === 'AT_OUTDOOR').length;

  return (
    <div className="p-6">
      <DataTable
        title="Rooting Register"
        description={`Total: ${pagination.total} | Active: ${activeCount} | Completed: ${completedCount}`}
        columns={columns}
        records={showAll ? rootedBatches : rootedBatches.filter((b: any) => b.state === 'ACTIVE' || b.state === 'OUTDOOR_READY')}
        exportFileName="rooted_batches"
        addButton={
          <button
            type="button"
            onClick={() => setShowAll(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
              showAll ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showAll ? 'bg-white' : 'bg-gray-400'}`} />
            Show All
          </button>
        }
        pagination={pagination}
      />
    </div>
  );
}

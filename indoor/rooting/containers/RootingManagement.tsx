import { RootingTable } from '../components/RootingTable';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { useRootingData } from '../hooks/useRootingData';
export function RootingManagement() {
  const { rootedBatches, loading, error, pagination } = useRootingData();
  const [showAll, setShowAll] = useState(false);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-IN');
  };

  const columns = [
    { key: 'batchCode', label: 'Batch Code' },
    { key: 'plantName', label: 'Plant Name' },
    { key: 'labNumber', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'mediaCode', label: 'Media Code', render: (v: string) => v || '—' },
    { key: 'qtyIn', label: 'Bottles Entered' },
    { key: 'qtyContaminated', label: 'Contamination' },
    { key: 'qtySold', label: 'Sold' },
    { key: 'qtyAvailable', label: 'Available' },
    { key: 'sourceBatchStage', label: 'Source Stage' },
    { key: 'rootingDate', label: 'Rooting Date', render: (value: string | null) => formatDate(value) },
    { key: 'state', label: 'State' },
  ];

  if (loading) return <div className="p-6">Loading rooted batches...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  const activeCount = rootedBatches.filter((b: any) => b.state === 'ACTIVE' || b.state === 'OUTDOOR_READY').length;
  const completedCount = rootedBatches.filter((b: any) => b.state === 'SOLD_OUT' || b.state === 'AT_OUTDOOR').length;

  return (
    <div className="p-6">
      <Tabs defaultValue="register" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="register">Rooting Register</TabsTrigger>
        </TabsList>

        <TabsContent value="register">
      <RootingTable
        title="Rooting Register"
        description={`Total: ${pagination.total} | Active: ${activeCount} | Completed: ${completedCount}`}
        columns={columns}
        records={showAll ? rootedBatches : rootedBatches.filter((b: any) => b.state === 'ACTIVE' || b.state === 'OUTDOOR_READY')}
        exportFileName="rooted_batches"
        hideBorder={true}
        addButton={
          <button
            type="button"
            onClick={() => setShowAll(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
              showAll ? 'erp-accent-bg erp-accent-text border-[#7db86a]' : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showAll ? 'bg-white' : 'bg-gray-400'}`} />
            Show All
          </button>
        }
        pagination={pagination}
      />
        </TabsContent>
      </Tabs>
    </div>
  );
}

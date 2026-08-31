import { RootingTable } from '../components/RootingTable';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { useRootingData } from '../hooks/useRootingData';
import { BatchOperatorLineEditModal } from '../../batch-operator-lines/components/BatchOperatorLineEditModal';
import { indoorApi } from '../../api/indoorApi';
import { useNotify } from '../../../shared/hooks/useNotify';
import type { BatchOperatorLine } from '../../types';

export function RootingManagement() {
  const { rootedBatches, loading, error, pagination, refetch } = useRootingData();
  const notify = useNotify();
  const [showAll, setShowAll] = useState(false);
  const [editingLines, setEditingLines] = useState<BatchOperatorLine[] | null>(null);

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

  const handleEdit = async (record: any) => {
    if (record.state !== 'ACTIVE') return;
    try {
      const lines = await indoorApi.batchOperatorLines.get({
        eventCode: record.eventCode,
        sourceTable: 'rooted_batches',
        sourceRecordId: record.id,
      });
      const group = Array.isArray(lines) ? lines : [];
      if (group.length === 0) {
        notify.error('No operator lines found for this rooting record');
        return;
      }
      setEditingLines(group);
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'Failed to load operator data');
      setEditingLines(null);
    }
  };

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
        onEdit={handleEdit}
        filterConfig={{
          filter1Key: 'plantName',
          filter1Label: 'Plant Name',
          filter2Key: 'batchCode',
          filter2Label: 'Batch Name',
        }}
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

      {editingLines && (
        <BatchOperatorLineEditModal
          lines={editingLines}
          onClose={() => setEditingLines(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}

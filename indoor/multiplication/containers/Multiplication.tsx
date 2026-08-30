import { MultiplicationTable } from '../components/MultiplicationTable';
import { useState } from 'react';
import { useMultiplicationData } from '../hooks/useMultiplicationData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { BatchOperatorLineEditModal } from '../../batch-operator-lines/components/BatchOperatorLineEditModal';
import { indoorApi } from '../../api/indoorApi';
import type { BatchOperatorLine } from '../../types';

export function Multiplication() {
  const { records, refetch, pagination } = useMultiplicationData();
  const [editingLines, setEditingLines] = useState<BatchOperatorLine[] | null>(null);
  const [showAll, setShowAll] = useState(false);

  const columns = [
    { key: 'multiplicationDate', label: 'Multiplication Date', render: (val: string) => val?.split('T')[0] },
    { key: 'toStage', label: 'Stage Number' },
    { key: 'batchCode', label: 'Batch Name' },
    { key: 'labNumber', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'mediaCode', label: 'Media Code' },
    { key: 'plantName', label: 'Plant Name' },
    { key: 'qtyInherited', label: 'Current Bottles (Before)' },
    { key: 'qtyIn', label: 'New Bottles (After)' },
    { key: 'notes', label: 'Notes' },
    { key: 'state', label: 'State' },
  ];

  const handleEdit = async (record: any) => {
    if (record.state !== 'ACTIVE') return;
    try {
      const lines = await indoorApi.batchOperatorLines.get({ eventCode: record.eventCode });
      const group = Array.isArray(lines) ? lines : [];
      if (group.length === 0) return;
      setEditingLines(group);
    } catch {
      setEditingLines(null);
    }
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="register" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="register">Multiplication Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="register">
          <MultiplicationTable
            title="Multiplication Register"
            columns={columns}
            records={showAll ? records : records.filter((r: any) => r.state === 'ACTIVE')}
            onEdit={handleEdit}
            filterConfig={{
              filter1Key: 'plantName',
              filter1Label: 'Plant Name',
              filter2Key: 'batchCode',
              filter2Label: 'Batch Name'
            }}
            exportFileName="multiplication_records"
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
            hideBorder={true}
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

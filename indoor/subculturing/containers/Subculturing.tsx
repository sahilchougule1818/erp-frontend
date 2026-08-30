import { SubculturingTable } from '../components/SubculturingTable';
import { useState } from 'react';
import { useSubcultureData } from '../hooks/useSubcultureData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Badge } from '../../../shared/ui/badge';
import { UnifiedOperatorEditModal } from '../../operators/components/UnifiedOperatorEditModal';

export function Subculturing() {
  const { records, refetch, pagination } = useSubcultureData();
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [showAll, setShowAll] = useState(false);

  const columns = [
    { key: 'subcultureDate', label: 'Subculture Date', render: (val: string) => val?.split('T')[0] },
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

  return (
    <div className="p-6">
      <Tabs defaultValue="register" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="register">Subculturing Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="register">
          <SubculturingTable
            title="Subculturing Register"
            columns={columns}
            records={showAll ? records : records.filter((r: any) => r.state === 'ACTIVE')}
            onEdit={(record) => { if (record.state === 'ACTIVE') setEditingRecord(record); }}
            filterConfig={{
              filter1Key: 'plantName',
              filter1Label: 'Plant Name',
              filter2Key: 'batchCode',
              filter2Label: 'Batch Name'
            }}
            exportFileName="subculturing_records"
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

      {editingRecord && (
        <UnifiedOperatorEditModal
          eventCode={editingRecord.eventCode}
          batchCode={editingRecord.batchCode}
          stage={editingRecord.toStage}
          activityType="event"
          onClose={() => setEditingRecord(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}

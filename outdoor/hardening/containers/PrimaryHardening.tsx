import { PrimaryHardeningTable } from '../components/PrimaryHardeningTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { usePrimaryHardeningData } from '../hooks';
import { createPhaseColumns, phaseColumnConfigs } from '../../components/phaseColumns';
import { UnifiedEditModal } from '../../workers/components/UnifiedEditModal';
import { usePhaseEditing } from '../hooks/usePhaseEditing';

export function PrimaryHardening() {
  const { records, refetch, pagination } = usePrimaryHardeningData();
  const { editingRecord, onEditRecord, closeEdit } = usePhaseEditing(refetch);

  const columns = createPhaseColumns(phaseColumnConfigs.primaryHardening);

  return (
    <div className="p-6">
      <Tabs defaultValue="primary" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="primary">Primary Hardening</TabsTrigger>
        </TabsList>
        
        <TabsContent value="primary">
          <PrimaryHardeningTable
            title="Primary Hardening Records"
            columns={columns}
            records={records}
            filterConfig={{ filter1Key: 'plantName', filter1Label: 'Plant Name', filter2Key: 'batchCode', filter2Label: 'Batch Code' }}
            exportFileName="primary-hardening"
            onEdit={onEditRecord}
            pagination={pagination}
          />
        </TabsContent>
      </Tabs>

      {editingRecord && (
        <UnifiedEditModal
          eventCode={editingRecord.eventCode}
          batchCode={editingRecord.batchCode}
          tunnel={editingRecord.currentTunnel ?? ''}
          phase={'primary_hardening'}
          onClose={closeEdit}
        />
      )}
    </div>
  );
}

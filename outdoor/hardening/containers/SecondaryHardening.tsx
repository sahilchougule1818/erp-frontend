import { SecondaryHardeningTable } from '../components/SecondaryHardeningTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { useSecondaryHardeningData } from '../hooks';
import { createPhaseColumns, phaseColumnConfigs } from '../../components/phaseColumns';
import { UnifiedEditModal } from '../../workers/components/UnifiedEditModal';
import { usePhaseEditing } from '../hooks/usePhaseEditing';

export function SecondaryHardening() {
  const { records, refetch, pagination } = useSecondaryHardeningData();
  const { editingRecord, onEditRecord, closeEdit } = usePhaseEditing(refetch);

  const columns = createPhaseColumns(phaseColumnConfigs.secondaryHardening);

  return (
    <div className="p-6">
      <Tabs defaultValue="secondary" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="secondary">Secondary Hardening</TabsTrigger>
        </TabsList>
        
        <TabsContent value="secondary">
          <SecondaryHardeningTable
            title="Secondary Hardening Records"
            columns={columns}
            records={records}
            filterConfig={{ filter1Key: 'plantName', filter1Label: 'Plant Name', filter2Key: 'batchCode', filter2Label: 'Batch Code' }}
            exportFileName="secondary-hardening"
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
          phase={'secondary_hardening'}
          onClose={closeEdit}
        />
      )}
    </div>
  );
}

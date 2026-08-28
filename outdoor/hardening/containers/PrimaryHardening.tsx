import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { usePrimaryHardeningData } from '../hooks';
import { DataTable } from '../../../shared/components/DataTable';
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
          <DataTable
            title=""
            columns={columns}
            records={records}
            filterConfig={{ filter1Key: 'plant_name', filter1Label: 'Plant Name', filter2Key: 'batch_code', filter2Label: 'Batch Code' }}
            exportFileName="primary-hardening"
            onEdit={onEditRecord}
            pagination={pagination}
          />
        </TabsContent>
      </Tabs>

      {editingRecord && (
        <UnifiedEditModal
          eventCode={editingRecord.event_code}
          batchCode={editingRecord.batch_code}
          tunnel={editingRecord.current_tunnel ?? ''}
          phase={'primary_hardening'}
          onClose={closeEdit}
        />
      )}
    </div>
  );
}

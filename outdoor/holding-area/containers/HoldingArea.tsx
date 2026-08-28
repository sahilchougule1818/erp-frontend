import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { useHoldingAreaData } from '../hooks';
import { DataTable } from '../../../shared/components/DataTable';
import { createPhaseColumns, phaseColumnConfigs } from '../../components/phaseColumns';
import { UnifiedEditModal } from '../../workers/components/UnifiedEditModal';
import { usePhaseEditing } from '../../hardening/hooks/usePhaseEditing';

export function HoldingArea() {
  const { records, refetch, pagination } = useHoldingAreaData();
  const { editingRecord, onEditRecord, closeEdit } = usePhaseEditing(refetch);

  // Use shared config — includes source_phase, mortality, sold, and available columns
  const baseColumns = createPhaseColumns(phaseColumnConfigs.holdingArea);

  // Replace 'current_tunnel' with 'source_tunnel' for holding area
  const columns = baseColumns.map(col => {
    if (col.key === 'current_tunnel') {
      return { ...col, key: 'source_tunnel', label: 'Source Tunnel' };
    }
    return col;
  });

  return (
    <div className="p-6">
      <Tabs defaultValue="holding" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="holding">Holding Area</TabsTrigger>
        </TabsList>
        
        <TabsContent value="holding">
          <DataTable
            title=""
            columns={columns}
            records={records}
            filterConfig={{ filter1Key: 'batch_code', filter1Label: 'Batch Code', filter2Key: 'plant_name', filter2Label: 'Plant Name' }}
            exportFileName="holding-area"
            onEdit={onEditRecord}
            pagination={pagination}
          />
        </TabsContent>
      </Tabs>

      {editingRecord && (
        <UnifiedEditModal
          eventCode={editingRecord.event_code}
          batchCode={editingRecord.batch_code}
          tunnel={editingRecord.source_tunnel ?? ''}
          phase={editingRecord.source_phase ?? 'holding_area'}
          onClose={closeEdit}
        />
      )}
    </div>
  );
}

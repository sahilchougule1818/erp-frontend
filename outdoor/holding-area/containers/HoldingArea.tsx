import { HoldingAreaTable } from '../components/HoldingAreaTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { useHoldingAreaData } from '../hooks';
import { createPhaseColumns, phaseColumnConfigs } from '../../components/phaseColumns';
import { UnifiedEditModal } from '../../workers/components/UnifiedEditModal';
import { usePhaseEditing } from '../../hardening/hooks/usePhaseEditing';

export function HoldingArea() {
  const { records, refetch, pagination } = useHoldingAreaData();
  const { editingRecord, onEditRecord, closeEdit } = usePhaseEditing(refetch);

  // Use shared config — includes sourcePhase, mortality, sold, and available columns
  const baseColumns = createPhaseColumns(phaseColumnConfigs.holdingArea);

  // Replace 'currentTunnel' with 'sourceTunnel' for holding area
  const columns = baseColumns.map(col => {
    if (col.key === 'currentTunnel') {
      return { ...col, key: 'sourceTunnel', label: 'Source Tunnel' };
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
          <HoldingAreaTable
            title="Holding Area Records"
            columns={columns}
            records={records}
            filterConfig={{ filter1Key: 'batchCode', filter1Label: 'Batch Code', filter2Key: 'plantName', filter2Label: 'Plant Name' }}
            exportFileName="holding-area"
            onEdit={onEditRecord}
            pagination={pagination}
          />
        </TabsContent>
      </Tabs>

      {editingRecord && (
        <UnifiedEditModal
          eventCode={editingRecord.eventCode}
          batchCode={editingRecord.batchCode}
          tunnel={editingRecord.sourceTunnel ?? ''}
          phase={editingRecord.sourcePhase ?? 'holding_area'}
          onClose={closeEdit}
        />
      )}
    </div>
  );
}

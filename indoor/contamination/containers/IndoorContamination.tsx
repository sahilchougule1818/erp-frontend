import { ContaminationTable } from '../components/ContaminationTable';
import { useIndoorContaminationData } from '../hooks/useIndoorContaminationData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { useEffect } from 'react';

export function IndoorContamination() {
  const { records, summary, fetchRecords, fetchSummary, pagination } = useIndoorContaminationData();

  useEffect(() => {
    fetchRecords();
    fetchSummary();
  }, [fetchRecords, fetchSummary]);

  const summaryColumns = [
    { key: 'batchCode', label: 'Batch Code' },
    { key: 'plantName', label: 'Plant Name' },
    { key: 'labNumber', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'totalQtyContaminated', label: 'Total Contamination' },
  ];

  const recordsColumns = [
    { key: 'recordedAt', label: 'Recorded At', render: (val: string) => val?.split('T')[0] },
    { key: 'batchCode', label: 'Batch Code' },
    { key: 'plantName', label: 'Plant Name' },
    { key: 'labNumber', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'stage', label: 'Stage' },
    { key: 'qtyContaminated', label: 'Contamination' },
    { key: 'notes', label: 'Notes' },
    { key: 'state', label: 'State' }
  ];

  return (
    <div className="p-6">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="summary">Contamination Summary</TabsTrigger>
          <TabsTrigger value="records">Detailed Records</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <ContaminationTable
            title="Contamination Summary"
            columns={summaryColumns}
            records={summary}
            exportFileName="contamination_summary"
          />
        </TabsContent>

        <TabsContent value="records">
          <ContaminationTable
            title="Detailed Records"
            columns={recordsColumns}
            records={records}
            filterConfig={{
              filter1Key: 'plantName',
              filter1Label: 'Plant Name',
              filter2Key: 'batchCode',
              filter2Label: 'Batch Name'
            }}
            exportFileName="indoor_contamination_records"
            pagination={pagination}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

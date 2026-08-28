import { useIndoorContaminationData } from '../hooks/useIndoorContaminationData';
import { DataTable } from '../../../shared/components/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { useEffect } from 'react';

export function IndoorContamination() {
  const { records, summary, fetchRecords, fetchSummary, pagination } = useIndoorContaminationData();

  useEffect(() => {
    fetchRecords();
    fetchSummary();
  }, [fetchRecords, fetchSummary]);

  const summaryColumns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'lab_number', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'total_qty_contaminated', label: 'Total Contamination' },
  ];

  const recordsColumns = [
    { key: 'recorded_at', label: 'Recorded At', render: (val: string) => val?.split('T')[0] },
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'lab_number', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'stage', label: 'Stage' },
    { key: 'qty_contaminated', label: 'Contamination' },
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
          <DataTable
            title=""
            columns={summaryColumns}
            records={summary}
            exportFileName="contamination_summary"
          />
        </TabsContent>

        <TabsContent value="records">
          <DataTable
            title=""
            columns={recordsColumns}
            records={records}
            filterConfig={{
              filter1Key: 'plant_name',
              filter1Label: 'Plant Name',
              filter2Key: 'batch_code',
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

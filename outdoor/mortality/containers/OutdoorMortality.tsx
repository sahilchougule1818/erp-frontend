import { useMortalityData } from '../hooks';
import { DataTable }        from '../../../shared/components/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';

export function OutdoorMortality() {
  const { log, summary, loading, paginationLog, paginationSummary } = useMortalityData();

  const summaryColumns = [
    { key: 'batchCode',      label: 'Batch Code' },
    {
      key: 'totalMortality',
      label: 'Total Mortality',
      render: (val: number) => (
        <span className="font-semibold text-red-600">{val ?? 0}</span>
      ),
    },
  ];

  const logColumns = [
    {
      key: 'recordedAt',
      label: 'Date',
      render: (val: string) => val?.split('T')[0] ?? '—',
    },
    { key: 'batchCode',  label: 'Batch Code' },
    { key: 'phaseName',  label: 'Phase' },
    { key: 'toLocation',      label: 'Tunnel',
      render: (val: string | null) => val ?? '—' },
    {
      key: 'mortalityCount',
      label: 'Mortality Count',
    },
    { key: 'mortalityReason',      label: 'Reason',
      render: (val: string | null) => val ?? '—' },
  ];

  return (
    <div className="p-6">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="summary">Mortality Summary</TabsTrigger>
          <TabsTrigger value="history">Change History</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <DataTable
            title=""
            columns={summaryColumns}
            records={summary}
            exportFileName="mortality-summary"
            readOnly
            pagination={paginationSummary}
          />
        </TabsContent>

        <TabsContent value="history">
          <DataTable
            title=""
            columns={logColumns}
            records={log}
            filterConfig={{
              filter1Key: 'batchCode', filter1Label: 'Batch Code',
              filter2Key: 'toLocation', filter2Label: 'Tunnel',
            }}
            exportFileName="mortality-records"
            readOnly
            pagination={paginationLog}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

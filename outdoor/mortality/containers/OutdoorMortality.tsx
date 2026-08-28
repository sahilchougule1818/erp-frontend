import { useMortalityData } from '../hooks';
import { DataTable }        from '../../../shared/components/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';

export function OutdoorMortality() {
  const { log, summary, loading, paginationLog, paginationSummary } = useMortalityData();

  const summaryColumns = [
    { key: 'batch_code',      label: 'Batch Code' },
    {
      key: 'total_mortality',
      label: 'Total Mortality',
      render: (val: number) => (
        <span className="font-semibold text-red-600">{val ?? 0}</span>
      ),
    },
  ];

  const logColumns = [
    {
      key: 'recorded_at',
      label: 'Date',
      render: (val: string) => val?.split('T')[0] ?? '—',
    },
    { key: 'batch_code',  label: 'Batch Code' },
    { key: 'phase_name',  label: 'Phase' },
    { key: 'to_location',      label: 'Tunnel',
      render: (val: string | null) => val ?? '—' },
    {
      key: 'mortality_count',
      label: 'Mortality Count',
    },
    { key: 'mortality_reason',      label: 'Reason',
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
              filter1Key: 'batch_code', filter1Label: 'Batch Code',
              filter2Key: 'to_location', filter2Label: 'Tunnel',
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

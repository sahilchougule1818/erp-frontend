import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { useTunnelShiftsData } from '../hooks';
import { DataTable } from '../../../shared/components/DataTable';

const movementTypeLabel = (val: string) => {
  const map: Record<string, string> = {
    IMPORT: 'Import',
    SHIFT: 'Shift',
    TRANSITION: 'Transition',
  };
  return map[val] ?? val;
};

const movementTypeBadge = (val: string) => {
  const cls =
    val === 'IMPORT' ? 'bg-green-50 text-green-700 border-green-200' :
    val === 'SHIFT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
    val === 'TRANSITION' ? 'bg-purple-50 text-purple-700 border-purple-200' :
    'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <span className={`px-2 py-1 rounded border text-base shadow-none ${cls}`}>
      {movementTypeLabel(val)}
    </span>
  );
};


export function TunnelShifts() {
  const { records, refetch, pagination } = useTunnelShiftsData();

  const columns = [
    {
      key: 'moved_at',
      label: 'Date',
      render: (val: string) => val?.split('T')[0] ?? '',
    },
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant Name' },
    {
      key: 'movement_type',
      label: 'Type',
      render: (val: string) => movementTypeBadge(val),
    },
    {
      key: 'from_location',
      label: 'From',
      render: (val: string | null) => val ?? '—',
    },
    {
      key: 'to_location',
      label: 'To',
      render: (val: string | null) => val ?? '—',
    },
    {
      key: 'plants_at_entry',
      label: 'Plants',
      render: (val: number) => Number(val || 0).toLocaleString(),
    },
    {
      key: 'mortality_count',
      label: 'Mortality',
      render: (val: number) => {
        const n = Number(val ?? 0);
        return n > 0
          ? <span className="text-red-600 font-semibold">{n.toLocaleString()}</span>
          : <span>{n.toLocaleString()}</span>;
      },
    },
    {
      key: 'sold_count',
      label: 'Sold',
      render: (val: number) => Number(val ?? 0).toLocaleString(),
    },
  ];

  return (
    <div className="p-6">
      <Tabs defaultValue="shifts" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="shifts">Shifting Records</TabsTrigger>
        </TabsList>
        
        <TabsContent value="shifts">
          <DataTable
            title=""
            columns={columns}
            records={records}
            filterConfig={{
              filter1Key: 'batch_code', filter1Label: 'Batch Code',
              filter2Key: 'movement_type', filter2Label: 'Type',
            }}
            exportFileName="movement-journal"
            pagination={pagination}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

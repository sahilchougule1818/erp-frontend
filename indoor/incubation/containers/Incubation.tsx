import { IncubationTable } from '../components/IncubationTable';
import { useState } from 'react';
import { useIncubationData } from '../hooks/useIncubationData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';

export function Incubation() {
  const { records, pagination } = useIncubationData();
  const [showAll, setShowAll] = useState(false);

  const columns = [
    { key: 'incubationDate', label: 'Incubation Date', render: (val: string) => val?.split('T')[0] },
    { key: 'stage', label: 'Stage' },
    { key: 'batchCode', label: 'Batch Code' },
    { key: 'labNumber', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'mediaCode', label: 'Media Code' },
    { key: 'plantName', label: 'Plant Name' },
    { key: 'qtyIn', label: 'Bottles Entered' },
    { key: 'qtyContaminated', label: 'Contamination' },
    { key: 'qtySold', label: 'Sold' },
    { key: 'qtyAvailable', label: 'Available' },
    { key: 'incubationPeriod', label: 'Period (Days)' },
    { key: 'temperature', label: 'Temp' },
    { key: 'humidity', label: 'Humidity' },
    { key: 'lightIntensity', label: 'Light Intensity' },
    {
      key: 'isRooted',
      label: 'Rooting',
      render: (v: boolean) => v ? 'YES' : 'NO'
    },
    { key: 'state', label: 'State' },
  ];

  return (
    <div className="p-6">
      <Tabs defaultValue="register" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="register">Incubation Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="register">
          <IncubationTable
            title="Incubation Register"
            columns={columns}
            records={showAll ? records : records.filter((r: any) => r.state === 'ACTIVE')}
            filterConfig={{
              filter1Key: 'plantName',
              filter1Label: 'Plant Name',
              filter2Key: 'batchCode',
              filter2Label: 'Batch Name'
            }}
            exportFileName="incubation_records"
            addButton={
              <button
                type="button"
                onClick={() => setShowAll(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                  showAll ? 'erp-accent-bg erp-accent-text border-[#7db86a]' : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showAll ? 'bg-white' : 'bg-gray-400'}`} />
                Show All
              </button>
            }
            pagination={pagination}
            hideBorder={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

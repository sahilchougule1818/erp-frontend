import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { DataTable } from '../../../shared/components/DataTable';
import { indoorApi } from '../../services/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import { useNotify } from '../../../shared/hooks/useNotify';
import { applySpringPage } from '../../../shared/utils/springPage';

export function Sampling() {
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  const { labNumber } = useLabContext();
  const notify = useNotify();

  useEffect(() => {
    loadSamples();
  }, [activeTab, labNumber, currentPage]);

  const loadSamples = async () => {
    setLoading(true);
    try {
      let res: any;
      if (activeTab === 'create') res = await indoorApi.sampling.getSubmissions({ labNumber, page: currentPage, limit: 10 });
      else if (activeTab === 'report') res = await indoorApi.sampling.getResults({ labNumber, page: currentPage, limit: 10 });
      else res = await indoorApi.sampling.getSummary({ labNumber, page: currentPage, limit: 10 });

      applySpringPage(res, setSamples, setPagination);
    } catch (error) {
      console.error('Failed to load samples:', error);
      setSamples([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleDeleteCreate = async (id: number) => {
    try {
      await indoorApi.sampling.deleteSubmission(id);
      notify.success('Deleted successfully');
      loadSamples();
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Failed to delete');
    }
  };

  const handleDeleteReport = async (id: number) => {
    try {
      await indoorApi.sampling.deleteResult(id);
      notify.success('Deleted successfully');
      loadSamples();
    } catch (error) {
      notify.error('Failed to delete');
    }
  };

  const summaryColumns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant' },
    { key: 'lab_number', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'current_stage', label: 'Stage' },
    { key: 'current_phase', label: 'Phase' },
    { key: 'plant_age_at_sampling', label: 'Plant Age at Sampling', render: (val: number) => val !== null && val !== undefined ? `${val} days` : '-' },
    { key: 'sample_date', label: 'Sample Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '-' },
    { key: 'result', label: 'Result' },
    { key: 'received_date', label: 'Received Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '-' },
    { key: 'seed_certificate_number', label: 'Seed Cert. No', render: (val: string) => val || '-' }
  ];

  const createColumns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant' },
    { key: 'lab_number', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'current_stage', label: 'Stage' },
    { key: 'current_phase', label: 'Phase' },
    { key: 'plant_age_at_sampling', label: 'Plant Age at Sampling', render: (val: number) => val !== null && val !== undefined ? `${val} days` : '-' },
    { key: 'sample_date', label: 'Sample Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '-' },
    { key: 'notes', label: 'Notes', render: (val: string) => val || '-' },
    { key: 'actions', label: 'Actions', render: (_: any, record: any) => (
      <Button size="sm" variant="destructive" onClick={() => handleDeleteCreate(record.id)}>Delete</Button>
    )}
  ];

  const reportColumns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'lab_number', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'received_date', label: 'Received Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '-' },
    { key: 'result', label: 'Result' },
    { key: 'seed_certificate_number', label: 'Seed Cert. No', render: (val: string) => val || '-' },
    { key: 'reason', label: 'Reason', render: (val: string) => val || '-' },
    { key: 'actions', label: 'Actions', render: (_: any, record: any) => (
      <Button size="sm" variant="destructive" onClick={() => handleDeleteReport(record.id)}>Delete</Button>
    )}
  ];

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="create">Submissions</TabsTrigger>
          <TabsTrigger value="report">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <DataTable
            title=""
            columns={summaryColumns}
            records={samples || []}
            filterConfig={{
              filter1Key: 'batch_code',
              filter1Label: 'Batch Code',
              filter2Key: 'status',
              filter2Label: 'Status'
            }}
            exportFileName="sampling_summary"
            pagination={{
              ...pagination,
              onPageChange: handlePageChange
            }}
          />
        </TabsContent>

        <TabsContent value="create">
          <DataTable
            title=""
            columns={createColumns}
            records={samples || []}
            filterConfig={{
              filter1Key: 'batch_code',
              filter1Label: 'Batch Code',
              filter2Key: 'plant_name',
              filter2Label: 'Plant Name'
            }}
            exportFileName="sampling_submissions"
            pagination={{
              ...pagination,
              onPageChange: handlePageChange
            }}
          />
        </TabsContent>

        <TabsContent value="report">
          <DataTable
            title=""
            columns={reportColumns}
            records={samples || []}
            filterConfig={{
              filter1Key: 'batch_code',
              filter1Label: 'Batch Code',
              filter2Key: 'status',
              filter2Label: 'Status'
            }}
            exportFileName="sampling_results"
            pagination={{
              ...pagination,
              onPageChange: handlePageChange
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

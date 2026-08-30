import { SamplingTable } from '../components/SamplingTable';
import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { indoorApi } from '../../api/indoorApi';
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
    { key: 'batchCode', label: 'Batch Code' },
    { key: 'plantName', label: 'Plant' },
    { key: 'labNumber', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'currentStage', label: 'Stage' },
    { key: 'currentPhase', label: 'Phase' },
    { key: 'plantAgeAtSampling', label: 'Plant Age at Sampling', render: (val: number) => val !== null && val !== undefined ? `${val} days` : '-' },
    { key: 'sampleDate', label: 'Sample Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '-' },
    { key: 'result', label: 'Result' },
    { key: 'receivedDate', label: 'Received Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '-' },
    { key: 'seedCertificateNumber', label: 'Seed Cert. No', render: (val: string) => val || '-' }
  ];

  const createColumns = [
    { key: 'batchCode', label: 'Batch Code' },
    { key: 'plantName', label: 'Plant' },
    { key: 'labNumber', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'currentStage', label: 'Stage' },
    { key: 'currentPhase', label: 'Phase' },
    { key: 'plantAgeAtSampling', label: 'Plant Age at Sampling', render: (val: number) => val !== null && val !== undefined ? `${val} days` : '-' },
    { key: 'sampleDate', label: 'Sample Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '-' },
    { key: 'notes', label: 'Notes', render: (val: string) => val || '-' },
    { key: 'actions', label: 'Actions', render: (_: any, record: any) => (
      <Button size="sm" variant="destructive" onClick={() => handleDeleteCreate(record.id)}>Delete</Button>
    )}
  ];

  const reportColumns = [
    { key: 'batchCode', label: 'Batch Code' },
    { key: 'labNumber', label: 'Lab', render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'receivedDate', label: 'Received Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '-' },
    { key: 'result', label: 'Result' },
    { key: 'seedCertificateNumber', label: 'Seed Cert. No', render: (val: string) => val || '-' },
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
          <SamplingTable
            title="Sampling Register"
            columns={summaryColumns}
            records={samples || []}
            filterConfig={{
              filter1Key: 'batchCode',
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
          <SamplingTable
            title="Report Samples"
            columns={createColumns}
            records={samples || []}
            filterConfig={{
              filter1Key: 'batchCode',
              filter1Label: 'Batch Code',
              filter2Key: 'plantName',
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
          <SamplingTable
            title="Sample Results"
            columns={reportColumns}
            records={samples || []}
            filterConfig={{
              filter1Key: 'batchCode',
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

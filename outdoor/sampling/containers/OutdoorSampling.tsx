import { OutdoorSamplingTable } from '../components/OutdoorSamplingTable';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { outdoorApi } from '../../api/outdoorApi';
import { useNotify } from '../../../shared/hooks/useNotify';
import { Button } from '../../../shared/ui/button';
import { Trash2 } from 'lucide-react';
import { parseSpringPage } from '../../../shared/utils/springPage';
// Sampling uses two tables after refactor:
//   sampling_submissions  (was: create_sampling)
//   sampling_results      (was: report_sampling)
// certificate_no renamed to certificateNumber in sampling_results.

export function OutdoorSampling() {
  const [samples, setSamples] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'submissions' | 'results'>('summary');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const notify = useNotify();

  useEffect(() => { loadSamples(); }, [activeTab, currentPage]);

  const loadSamples = async () => {
    try {
      let response: any;
      if (activeTab === 'summary') response = await outdoorApi.sampling.getSummary(currentPage, limit);
      if (activeTab === 'submissions') response = await outdoorApi.sampling.getSubmissions(currentPage, limit);
      if (activeTab === 'results') response = await outdoorApi.sampling.getResults(currentPage, limit);
      const parsed = parseSpringPage(response);
      setSamples(parsed.data);
      setCurrentPage(parsed.pagination.page);
      setTotalPages(parsed.pagination.totalPages);
      setTotal(parsed.pagination.total);
    } catch (error) {
      console.error('Failed to load samples:', error);
      setSamples([]);
    }
  };

  const handleDelete = async (record: any) => {
    try {
      if (activeTab === 'submissions') {
        if (!confirm('Are you sure you want to delete this sample submission?')) return;
        await outdoorApi.sampling.deleteSubmission(record.id);
        notify.success('Submission deleted successfully');
      } else if (activeTab === 'results') {
        if (!confirm('Are you sure you want to delete this result? This will revert the submission to pending status.')) return;
        await outdoorApi.sampling.deleteResult(record.id);
        notify.success('Result deleted successfully');
      }
      loadSamples();
    } catch (error: any) {
      // Gracefully handles the backend constraint if trying to delete a submission with a result!
      notify.error(error.response?.data?.error || 'Failed to delete');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Summary columns — combined view of submissions + results
  const summaryColumns = [
    { key: 'batchCode',    label: 'Batch Code' },
    { key: 'plantName',    label: 'Plant Name' },
    { key: 'currentPhase', label: 'Phase' },
    { key: 'currentTunnel',label: 'Tunnel' },
    { key: 'sampleDate',   label: 'Sample Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '—' },
    { key: 'plantAgeAtSampling', label: 'Age at Sampling',
      render: (val: number) => val != null ? `${val} days` : '—' },
    { key: 'status',        label: 'Result',
      render: (val: string) => {
        if (val === 'c') return <span className="px-2 py-1 rounded border text-base bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none">Completed</span>;
        if (val === 's') return <span className="px-2 py-1 rounded border text-base bg-amber-50 text-amber-700 border-amber-200 shadow-none">Sent</span>;
        return <span className="px-2 py-1 rounded border text-base bg-gray-50 text-gray-600 border-gray-200 shadow-none">Pending</span>;
      }
    },
    { key: 'seedCertificateNumber', label: 'Seed Cert. No' },
  ];

  // Submissions columns — sampling_submissions table
  const submissionColumns = [
    { key: 'sampleDate',   label: 'Sample Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '—' },
    { key: 'batchCode',    label: 'Batch Code' },
    { key: 'plantName',    label: 'Plant Name' },
    { key: 'currentPhase', label: 'Phase' },
    { key: 'currentTunnel',label: 'Tunnel' },
    { key: 'plantAgeAtSampling', label: 'Age at Sampling',
      render: (val: number) => val != null ? `${val} days` : '—' },
    { key: 'notes',         label: 'Notes' },
    { key: 'actions',       label: 'Actions', render: (_: any, record: any) => (
      <div className="flex gap-1 justify-end">
        <Button variant="ghost" size="sm" onClick={() => handleDelete(record)} className="px-2" title="Delete Submission">
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    )},
  ];

  // Results columns — sampling_results table
  const resultColumns = [
    { key: 'batchCode',    label: 'Batch Code' },
    { key: 'receivedDate', label: 'Received Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '—' },
    { key: 'status',        label: 'Result',
      render: (val: string) => {
        if (val === 'c') return <span className="px-2 py-1 rounded border text-base bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none">Completed</span>;
        if (val === 's') return <span className="px-2 py-1 rounded border text-base bg-amber-50 text-amber-700 border-amber-200 shadow-none">Sent</span>;
        return <span className="px-2 py-1 rounded border text-base bg-gray-50 text-gray-600 border-gray-200 shadow-none">Pending</span>;
      }
    },
    { key: 'seedCertificateNumber', label: 'Seed Cert. No' },
    { key: 'reason',        label: 'Notes' },
    { key: 'actions',       label: 'Actions', render: (_: any, record: any) => (
      <div className="flex gap-1 justify-end">
        <Button variant="ghost" size="sm" onClick={() => handleDelete(record)} className="px-2" title="Undo Result">
          <Trash2 className="w-4 h-4 text-orange-500" />
        </Button>
      </div>
    )},
  ];

  const getColumns = () => {
    if (activeTab === 'submissions') return submissionColumns;
    if (activeTab === 'results')     return resultColumns;
    return summaryColumns;
  };

  const getExportName = () => {
    if (activeTab === 'submissions') return 'sampling-submissions';
    if (activeTab === 'results')     return 'sampling-results';
    return 'sampling-summary';
  };

  return (
    <div className="p-6">
      <Tabs
        defaultValue="summary"
        onValueChange={(v: any) => handleTabChange(v as typeof activeTab)}
        className="w-full"
      >
        <TabsList className="w-full">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>  {/* was: Create */}
          <TabsTrigger value="results">Results</TabsTrigger>           {/* was: Report */}
        </TabsList>

        <TabsContent value={activeTab}>
          <OutdoorSamplingTable
            title="Outdoor Sampling Register"
            columns={getColumns()}
            records={samples}
            filterConfig={{
              filter1Key: 'batchCode',  filter1Label: 'Batch Code',
              filter2Key: 'plantName',  filter2Label: 'Plant Name',
            }}
            exportFileName={getExportName()}
            pagination={{
              currentPage,
              totalPages,
              total,
              limit,
              onPageChange: handlePageChange
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

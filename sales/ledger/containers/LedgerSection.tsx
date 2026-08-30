import { LedgerTable } from '../components/LedgerTable';
import React, { useState } from 'react';
import { Badge } from '../../../shared/ui/badge';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useLedger } from '../../hooks/useLedger';
import { useBankSummary } from '../../hooks/useBankAccounts';
import { useDashboardStats } from '../../hooks/useDashboard';
import { format } from 'date-fns';
import { LedgerFilterBar } from '../../components/LedgerFilterBar';
import { cn } from '../../../shared/ui/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';

const ENTRY_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  ADVANCE_IN:         { label: 'Advance In',   color: 'bg-blue-50 text-blue-700 border-blue-200' },
  PAYMENT_IN:         { label: 'Payment In',   color: 'bg-green-50 text-green-700 border-green-200' },
  REFUND_OUT:         { label: 'Refund Out',   color: 'bg-red-50 text-red-700 border-red-200' },
  STOCK_PURCHASE_OUT: { label: 'Purchase Out', color: 'bg-orange-50 text-orange-700 border-orange-200' },
};

const LedgerSection: React.FC = () => {
  const [filters, setFilters] = useState({
    bankAccountId: 'all',
    type: 'all',
    fromDate: '',
    toDate: '',
  });

  const { entries, loading, error, pagination, refetch } = useLedger(filters);
  const { summary, loading: summaryLoading } = useBankSummary();
  const { stats } = useDashboardStats();

  const handleChange = (key: string, value: string) =>
    setFilters(f => ({ ...f, [key]: value }));

  const handleReset = () =>
    setFilters({ bankAccountId: 'all', type: 'all', fromDate: '', toDate: '' });

  const handlePageChange = (page: number) => {
    refetch(page);
  };

  const netInflow  = Number(stats?.netInflow)  || 0;
  const netOutflow = Number(stats?.netOutflow) || 0;

  const fmt = (n: number) =>
    n >= 1_00_000 ? `₹${(n / 1_00_000).toFixed(1)}L`
    : n >= 1_000  ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${n.toLocaleString()}`;

  const columns = [
    {
      key: 'entryDate',
      label: 'Date',
      render: (val: string) => (
        <span className="text-base">
          {val ? format(new Date(val), 'dd MMM yyyy') : '—'}
        </span>
      )
    },
    {
      key: 'entryType',
      label: 'Particular',
      render: (val: string) => {
        const meta = ENTRY_TYPE_LABELS[val] ?? { label: val, color: 'bg-slate-50 text-slate-600 border-slate-200' };
        return <Badge className={cn(meta.color, 'border text-base')}>{meta.label}</Badge>;
      }
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (val: string) => <span className="text-base">{val || '—'}</span>
    },
    {
      key: 'orderId',
      label: 'Booking ID',
      render: (val: string) => <span className="text-base">{val || '—'}</span>
    },
    {
      key: 'transactionNumber',
      label: 'System TXN No.',
      render: (val: string) => <span className="text-base">{val || '—'}</span>
    },
    {
      key: 'paymentReference',
      label: 'Payment Ref',
      render: (val: string) => <span className="text-base">{val || '—'}</span>
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (val: string) => <span className="text-base">{val || 'Cash'}</span>
    },
    {
      key: 'bankAccountName',
      label: 'Account',
      render: (val: string) => <span className="text-base">{val || '—'}</span>
    },
    {
      key: 'refundId',
      label: 'Refund ID',
      render: (val: string) => <span className="text-base">{val || '—'}</span>
    },
    {
      key: 'stockPurchaseId',
      label: 'Purchase ID',
      render: (val: string) => <span className="text-base">{val || '—'}</span>
    },
    {
      key: 'debitAmount',
      label: 'Outflow (−)',
      render: (val: number) => <span className="text-base">{Number(val) > 0 ? `₹${Number(val).toLocaleString()}` : '—'}</span>
    },
    {
      key: 'creditAmount',
      label: 'Inflow (+)',
      render: (val: number) => <span className="text-base">{Number(val) > 0 ? `₹${Number(val).toLocaleString()}` : '—'}</span>
    },
  ];

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          Failed to load ledger: {error}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <div style={{ padding: '20px', backgroundColor: '#EAF3DE', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#3B6D11', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Funds Inflow</span>
            <TrendingUp style={{ color: '#3B6D11', width: '20px', height: '20px' }} />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#27500A', marginTop: '8px' }}>{fmt(netInflow)}</div>
          <div style={{ fontSize: '0.7rem', color: '#3B6D11', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>
            All time
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#FCEBEB', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#A32D2D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Funds Outflow</span>
            <TrendingDown style={{ color: '#A32D2D', width: '20px', height: '20px' }} />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#791F1F', marginTop: '8px' }}>{fmt(netOutflow)}</div>
          <div style={{ fontSize: '0.7rem', color: '#A32D2D', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>
            All time
          </div>
        </div>
      </div>

      <Tabs defaultValue="ledger" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="ledger">Financial Ledger</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ledger">
          <LedgerTable
            title="Financial Ledger"
            columns={columns}
            records={entries}
            filterConfig={null}
            addButton={
              <LedgerFilterBar
                filters={filters}
                accounts={summaryLoading ? [] : summary}
                onChange={handleChange}
                onReset={handleReset}
              />
            }
            exportFileName="financial_ledger"
            pagination={{
              currentPage: pagination.page,
              totalPages: pagination.totalPages,
              total: pagination.total,
              limit: pagination.limit,
              onPageChange: handlePageChange
            }}
          />
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default LedgerSection;
export { LedgerSection };

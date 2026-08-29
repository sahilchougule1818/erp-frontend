import React, { useState, useEffect } from 'react';
import { instantSaleApi } from '../api/instantSaleApi';
import { InstantSale } from '../types/instantSale.types';
import { DataTable } from '../../../shared/components/DataTable';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Plus as PlusIcon, ShoppingCart, IndianRupee } from 'lucide-react';
import { cn } from '../../../shared/ui/utils';
import { useNotify } from '../../../shared/hooks/useNotify';
import { CreateInstantSaleForm } from '../forms/CreateInstantSaleForm';
import { ManageInstantSaleDialog } from '../forms/ManageInstantSaleDialog';
import { useBankAccounts } from '../../hooks/useBankAccounts';
import { useIndoorStock, useOutdoorStock } from '../../hooks/useStock';
import { customerBookingsApi, bookingPaymentsApi, salesApi } from '../../services/salesApi';
import { extractApiErrorMessage } from '../../../shared/services/apiClient';
import { normalizeInstantSaleStats } from '../../utils/normalize';

export const InstantSalesList: React.FC = () => {
  const [sales, setSales] = useState<InstantSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const notify = useNotify();
  
  const { accounts } = useBankAccounts(true);
  const { stock: indoorStock } = useIndoorStock();
  const { stock: outdoorStock } = useOutdoorStock();

  const fetchSales = async () => {
    try {
      setLoading(true);
      const [data, statsData] = await Promise.all([
        instantSaleApi.getAll(),
        salesApi.dashboard.getInstantSaleStats()
      ]);
      setSales(data);
      setStats(normalizeInstantSaleStats(statsData as Record<string, unknown>));
    } catch (error: any) {
      notify.error(error.message || 'Failed to fetch instant sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const fmt = (n: number) =>
    n >= 1_00_000 ? `₹${(n / 1_00_000).toFixed(1)}L`
    : n >= 1_000  ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${n.toLocaleString()}`;

  const columns = [
    { key: 'order_id', label: 'Order ID' },
    {
      key: 'sale_date',
      label: 'Sale Date',
      render: (val: string) => (
        <span className="text-base">
          {val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      )
    },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'phone_number', label: 'Phone' },
    {
      key: 'items',
      label: 'Items',
      render: (_val: any, row: InstantSale) => {
        if (!row.items || row.items.length === 0) return <span className="text-base">—</span>;
        const summary = row.items.map((i) => {
          const batchInfo = i.batch_code ? ` (${i.batch_code})` : '';
          return `${i.plant_name}${batchInfo} × ${i.quantity}`;
        }).join(', ');
        return <span className="text-base" title={summary}>{summary}</span>;
      }
    },
    {
      key: 'base_amount',
      label: 'Base Amount',
      render: (val: number) => <span className="text-base">{`₹${Number(val || 0).toLocaleString()}`}</span>
    },
    {
      key: 'delivery_charges',
      label: 'Delivery Charges',
      render: (val: number) => <span className="text-base">{`₹${Number(val || 0).toLocaleString()}`}</span>
    },
    {
      key: 'cgst_percent',
      label: 'CGST',
      render: (val: number) => <span className="text-base">{`${Number(val || 0)}%`}</span>
    },
    {
      key: 'sgst_percent',
      label: 'SGST',
      render: (val: number) => <span className="text-base">{`${Number(val || 0)}%`}</span>
    },
    {
      key: 'total_amount',
      label: 'Total Amount',
      render: (val: number) => <span className="text-base font-semibold">{`₹${Number(val).toLocaleString()}`}</span>
    },
    {
      key: 'paid_amount',
      label: 'Paid',
      render: (val: number) => <span className="text-base">{`₹${Number(val).toLocaleString()}`}</span>
    },
    {
      key: 'remaining_amount',
      label: 'Remaining',
      render: (val: number) => <span className="text-base">{`₹${Number(val).toLocaleString()}`}</span>
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (val: string) => {
        const styles: any = {
          'Paid': 'bg-green-50 text-green-700 border-green-200',
          'Partially Paid': 'bg-blue-50 text-blue-700 border-blue-200',
          'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
        };
        return <Badge className={cn(styles[val] || 'bg-slate-50 text-slate-500 border-slate-200', 'border text-base')}>{val}</Badge>;
      }
    },
    {
      key: 'delivery_status',
      label: 'Status',
      render: (val: string) => {
        const styles: any = {
          'Delivered': 'bg-green-50 text-green-700 border-green-200',
          'Cancelled': 'bg-red-50 text-red-700 border-red-200',
        };
        return <Badge className={cn(styles[val] || 'bg-slate-50 text-slate-500 border-slate-200', 'border text-base')}>{val}</Badge>;
      }
    },
  ];

  const handleCreateSale = async (data: any) => {
    try {
      await instantSaleApi.create(data);
      notify.success('Instant sale created successfully');
      setShowCreateForm(false);
      fetchSales();
    } catch (error: any) {
      notify.error(error.response?.data?.message || error.message || 'Failed to create instant sale');
      throw error;
    }
  };

  const handleEditSale = async (sale: InstantSale) => {
    try {
      setSelectedSale(sale);
      const salePayments = await bookingPaymentsApi.getByBooking(sale.order_id);
      setPayments(salePayments);
      setShowManageDialog(true);
    } catch (error: any) {
      notify.error('Failed to load sale details');
    }
  };

  const handleAddPayment = async (data: any) => {
    try {
      const orderId = selectedSale.order_id;
      await bookingPaymentsApi.create({ ...data, order_id: orderId });
      notify.success('Payment added successfully');
      await fetchSales();
      const updatedPayments = await bookingPaymentsApi.getByBooking(orderId);
      setPayments(updatedPayments);
      // Update selected sale with fresh data
      const updatedSale = await instantSaleApi.getById(orderId);
      setSelectedSale(updatedSale);
    } catch (error: any) {
      notify.error(error.response?.data?.message || 'Failed to add payment');
      throw error;
    }
  };

  const handleDeletePayment = async (transactionNumber: string) => {
    try {
      await bookingPaymentsApi.delete(transactionNumber);
      notify.success('Payment deleted successfully');
      await fetchSales();
      const orderId = selectedSale.order_id;
      const updatedPayments = await bookingPaymentsApi.getByBooking(orderId);
      setPayments(updatedPayments);
      // Update selected sale with fresh data
      const updatedSale = await instantSaleApi.getById(orderId);
      setSelectedSale(updatedSale);
    } catch (error: any) {
      notify.error('Failed to delete payment');
      throw error;
    }
  };

  const handleStatusChange = async (booking: any, newStatus: string, fulfillment?: any) => {
    try {
      await customerBookingsApi.updateInstantSaleStatus(booking.order_id, { delivery_status: newStatus });
      notify.success('Status updated successfully');
      await fetchSales();
      setShowManageDialog(false);
    } catch (error: any) {
      notify.error('Failed to update status');
      throw error;
    }
  };

  const handleCancelSale = async (reason?: string) => {
    await customerBookingsApi.cancel(selectedSale.order_id, { cancellation_reason: reason }, true);
    notify.success('Sale cancelled successfully');
    await fetchSales();
    setShowManageDialog(false);
  };

  const handleUpdateSale = async () => {
    try {
      await fetchSales();
      const orderId = selectedSale.order_id;
      const updatedSale = await instantSaleApi.getById(orderId);
      setSelectedSale(updatedSale);
      notify.success('Sale updated successfully');
    } catch (error: any) {
      notify.error('Failed to refresh sale data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <div style={{ padding: '20px', backgroundColor: '#E6F1FB', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#185FA5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Instant Sales</span>
            <ShoppingCart style={{ color: '#185FA5', width: '20px', height: '20px' }} />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0C447C', marginTop: '8px' }}>{stats?.total_sales || 0}</div>
          <div style={{ fontSize: '0.7rem', color: '#185FA5', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>
            Order count
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#FAEEDA', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding Amount</span>
            <IndianRupee style={{ color: '#854F0B', width: '20px', height: '20px' }} />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#633806', marginTop: '8px' }}>{fmt(Number(stats?.outstanding_amount) || 0)}</div>
          <div style={{ fontSize: '0.7rem', color: '#854F0B', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>
            From customers
          </div>
        </div>
      </div>

      <DataTable
        title="Instant Sales"
        columns={columns}
        records={sales}
        onEdit={handleEditSale}
        addButton={
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setShowCreateForm(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" /> New Instant Sale
          </Button>
        }
        filterConfig={{
          filter1Key: 'customer_name',
          filter1Label: 'Search customer...',
          filter2Key: 'order_id',
          filter2Label: 'Order ID'
        }}
        exportFileName="instant_sales_export"
      />

      <CreateInstantSaleForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateSale}
      />

      <ManageInstantSaleDialog
        open={showManageDialog}
        onOpenChange={setShowManageDialog}
        selectedBooking={selectedSale}
        payments={payments}
        accounts={accounts || []}
        indoorBatches={indoorStock || []}
        outdoorBatches={outdoorStock || []}
        onAddPayment={handleAddPayment}
        onDeletePayment={handleDeletePayment}
        onStatusChange={handleStatusChange}
        onCancelBooking={handleCancelSale}
        onUpdate={handleUpdateSale}
      />
    </div>
  );
};

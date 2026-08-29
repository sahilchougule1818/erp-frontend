import React, { useState, useEffect } from 'react';
import { preBookingApi } from '../api/preBookingApi';
import { PreBooking } from '../types/preBooking.types';
import { DataTable } from '../../../shared/components/DataTable';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Plus as PlusIcon, Clock, IndianRupee } from 'lucide-react';
import { cn } from '../../../shared/ui/utils';
import { useNotify } from '../../../shared/hooks/useNotify';
import { extractApiErrorMessage } from '../../../shared/api/apiClient';
import { CreatePreBookingForm } from '../forms/CreatePreBookingForm';
import { ManagePreBookingDialog } from '../forms/ManagePreBookingDialog';
import { useBankAccounts } from '../../hooks/useBankAccounts';
import { useIndoorStock, useOutdoorStock } from '../../hooks/useStock';
import { bookingPaymentsApi, salesApi } from '../../api/salesApi';

export const PreBookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<PreBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const notify = useNotify();
  
  const { accounts } = useBankAccounts(true);
  const { stock: indoorStock } = useIndoorStock();
  const { stock: outdoorStock } = useOutdoorStock();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const [data, statsData] = await Promise.all([
        preBookingApi.getAll(),
        salesApi.dashboard.getPreBookingStats()
      ]);
      setBookings(data);
      setStats(statsData ?? null);
    } catch (error: any) {
      notify.error(extractApiErrorMessage(error) || 'Failed to fetch pre-bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fmt = (n: number) =>
    n >= 1_00_000 ? `₹${(n / 1_00_000).toFixed(1)}L`
    : n >= 1_000  ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${n.toLocaleString()}`;

  const columns = [
    { key: 'orderId', label: 'Order ID' },
    {
      key: 'bookingDate',
      label: 'Booking Date',
      render: (val: string) => (
        <span className="text-base">
          {val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      )
    },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'phoneNumber', label: 'Phone' },
    {
      key: 'items',
      label: 'Items',
      render: (_val: any, row: PreBooking) => {
        if (!row.items || row.items.length === 0) return <span className="text-base">—</span>;
        const summary = row.items.map((i) => `${i.plantName} × ${i.quantity}`).join(', ');
        return <span className="text-base" title={summary}>{summary}</span>;
      }
    },
    {
      key: 'expectedDeliveryDate',
      label: 'Expected Delivery',
      render: (val: string) => (
        <span className="text-base">
          {val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      )
    },
    {
      key: 'baseAmount',
      label: 'Base Amount',
      render: (val: number) => <span className="text-base">{`₹${Number(val || 0).toLocaleString()}`}</span>
    },
    {
      key: 'deliveryCharges',
      label: 'Delivery Charges',
      render: (val: number) => <span className="text-base">{`₹${Number(val || 0).toLocaleString()}`}</span>
    },
    {
      key: 'cgstPercent',
      label: 'CGST',
      render: (val: number) => <span className="text-base">{`${Number(val || 0)}%`}</span>
    },
    {
      key: 'sgstPercent',
      label: 'SGST',
      render: (val: number) => <span className="text-base">{`${Number(val || 0)}%`}</span>
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      render: (val: number) => <span className="text-base font-semibold">{`₹${Number(val).toLocaleString()}`}</span>
    },
    {
      key: 'paidAmount',
      label: 'Paid',
      render: (val: number) => <span className="text-base">{`₹${Number(val).toLocaleString()}`}</span>
    },
    {
      key: 'remainingAmount',
      label: 'Remaining',
      render: (val: number) => <span className="text-base">{`₹${Number(val).toLocaleString()}`}</span>
    },
    {
      key: 'paymentStatus',
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
      key: 'deliveryStatus',
      label: 'Delivery',
      render: (val: string) => {
        const styles: any = {
          'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
          'Partially Delivered': 'bg-blue-50 text-blue-700 border-blue-200',
          'Delivered': 'bg-green-50 text-green-700 border-green-200',
          'Cancelled': 'bg-red-50 text-red-700 border-red-200',
        };
        return <Badge className={cn(styles[val] || 'bg-slate-50 text-slate-500 border-slate-200', 'border text-base')}>{val}</Badge>;
      }
    },
  ];

  const handleCreateBooking = async (data: any) => {
    try {
      await preBookingApi.create(data);
      notify.success('Pre-booking created successfully');
      setShowCreateForm(false);
      fetchBookings();
    } catch (error: any) {
      notify.error(extractApiErrorMessage(error) || 'Failed to create pre-booking');
      throw error;
    }
  };

  const handleEditBooking = async (booking: PreBooking) => {
    try {
      setSelectedBooking(booking);
      const orderId = booking.orderId;
      const bookingPayments = await bookingPaymentsApi.getByBooking(orderId);
      setPayments(bookingPayments);
      setShowManageDialog(true);
    } catch (error: any) {
      notify.error(extractApiErrorMessage(error) || 'Failed to load booking details');
    }
  };

  const handleAddPayment = async (data: any) => {
    try {
      const orderId = selectedBooking.orderId;
      await bookingPaymentsApi.create({ ...data, orderId: orderId });
      notify.success('Payment added successfully');
      await fetchBookings();
      const updatedPayments = await bookingPaymentsApi.getByBooking(orderId);
      setPayments(updatedPayments);
      // Update selected booking with fresh data
      const updatedBooking = await preBookingApi.getById(orderId);
      setSelectedBooking(updatedBooking);
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeletePayment = async (transactionNumber: string) => {
    try {
      await bookingPaymentsApi.delete(transactionNumber);
      notify.success('Payment deleted successfully');
      await fetchBookings();
      const orderId = selectedBooking.orderId;
      const updatedPayments = await bookingPaymentsApi.getByBooking(orderId);
      setPayments(updatedPayments);
      // Update selected booking with fresh data
      const updatedBooking = await preBookingApi.getById(orderId);
      setSelectedBooking(updatedBooking);
    } catch (error: any) {
      throw error;
    }
  };

  const handleCancelBooking = async (reason?: string) => {
    try {
      const orderId = selectedBooking.orderId;
      await preBookingApi.cancel(orderId, { cancellationReason: reason });
      notify.success('Booking cancelled successfully');
      await fetchBookings();
      setShowManageDialog(false);
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateBooking = async () => {
    try {
      await fetchBookings();
      const orderId = selectedBooking.orderId;
      const updatedBooking = await preBookingApi.getById(orderId);
      setSelectedBooking(updatedBooking);
    } catch (error: any) {
      notify.error(extractApiErrorMessage(error) || 'Failed to refresh booking data');
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
        <div style={{ padding: '20px', backgroundColor: '#FEF3C7', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Deliveries</span>
            <Clock style={{ color: '#92400E', width: '20px', height: '20px' }} />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#78350F', marginTop: '8px' }}>{stats?.pendingDeliveries || 0}</div>
          <div style={{ fontSize: '0.7rem', color: '#92400E', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>
            Awaiting fulfillment
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#FAEEDA', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding Amount</span>
            <IndianRupee style={{ color: '#854F0B', width: '20px', height: '20px' }} />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#633806', marginTop: '8px' }}>{fmt(Number(stats?.outstandingAmount) || 0)}</div>
          <div style={{ fontSize: '0.7rem', color: '#854F0B', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>
            From customers
          </div>
        </div>
      </div>

      <DataTable
        title="Pre-Bookings"
        columns={columns}
        records={bookings}
        onEdit={handleEditBooking}
        addButton={
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setShowCreateForm(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" /> New Pre-Booking
          </Button>
        }
        filterConfig={{
          filter1Key: 'customerName',
          filter1Label: 'Search customer...',
          filter2Key: 'orderId',
          filter2Label: 'Order ID'
        }}
        exportFileName="pre_bookings_export"
      />

      <CreatePreBookingForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateBooking}
      />

      <ManagePreBookingDialog
        open={showManageDialog}
        onOpenChange={setShowManageDialog}
        selectedBooking={selectedBooking}
        payments={payments}
        accounts={accounts || []}
        indoorBatches={indoorStock || []}
        outdoorBatches={outdoorStock || []}
        onAddPayment={handleAddPayment}
        onDeletePayment={handleDeletePayment}
        onCancelBooking={handleCancelBooking}
        onUpdate={handleUpdateBooking}
      />
    </div>
  );
};

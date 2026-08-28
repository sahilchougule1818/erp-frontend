import React, { useState, useEffect } from 'react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Textarea } from '../../../shared/ui/textarea';
import { format } from 'date-fns';
import {
  History as HistoryIcon, Trash2,
  CheckCircle2, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, X, PenSquare, Download,
} from 'lucide-react';
import { PAYMENT_METHODS } from '../../constants/EventTypes';
import { cn } from '../../../shared/ui/utils';
import { customerBookingsApi, billingApi } from '../../services/salesApi';

type AllocationDraft = {
  batch_code: string;
  quantity: string;
};

type ItemAllocation = {
  item_number: number;
  allocations: AllocationDraft[];
};

interface ManageInstantSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBooking: any;
  payments: any[];
  accounts: any[];
  indoorBatches?: any[];
  outdoorBatches?: any[];
  onAddPayment: (data: any) => Promise<void>;
  onDeletePayment: (transactionNumber: string) => Promise<void>;
  onStatusChange: (
    booking: any,
    newStatus: string,
    fulfillment?: {
      fulfillment_type: string;
      allocations: { item_number: number; batch_code: string; quantity: number }[];
    },
  ) => Promise<void>;
  onCancelBooking: (reason?: string) => Promise<void>;
  onUpdate?: () => Promise<void>;
}

const EMPTY_ALLOCATION: AllocationDraft = { batch_code: '', quantity: '' };

export const ManageInstantSaleDialog: React.FC<ManageInstantSaleDialogProps> = ({
  open, onOpenChange, selectedBooking, payments, accounts,
  indoorBatches = [], outdoorBatches = [],
  onAddPayment, onDeletePayment, onStatusChange, onCancelBooking, onUpdate,
}) => {
  const [formData, setFormData] = useState({
    amount: '', payment_type: 'REGULAR', payment_method: 'Cash',
    payment_date: new Date().toISOString().split('T')[0],
    bank_account_id: '', payment_reference: '',
  });
  const [itemAllocations, setItemAllocations] = useState<ItemAllocation[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaymentHistoryExpanded, setIsPaymentHistoryExpanded] = useState(false);
  const [isEditingFinancials, setIsEditingFinancials] = useState(false);
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const [editedFinancials, setEditedFinancials] = useState({
    delivery_charges: '',
    cgst_percent: '',
    sgst_percent: '',
    expected_delivery_date: '',
  });
  const [pendingUndoPayment, setPendingUndoPayment] = useState<string | null>(null);

  useEffect(() => {
    if (open && selectedBooking) {
      const items = selectedBooking.items || [];
      setItemAllocations(items.map((item: any, idx: number) => ({
        item_number: item.item_number || idx + 1,
        allocations: [{ ...EMPTY_ALLOCATION }],
      })));
      setEditedItems(items.map((item: any) => ({ ...item })));
      setEditedFinancials({
        delivery_charges: selectedBooking.delivery_charges || '',
        cgst_percent: selectedBooking.cgst_percent || '',
        sgst_percent: selectedBooking.sgst_percent || '',
        expected_delivery_date: selectedBooking.expected_delivery_date || '',
      });
      setIsEditingFinancials(false);
      setPendingUndoPayment(null);
      setErrorMessage(null);
      setShowCancelConfirm(false);
      setCancellationReason('');
      setIsPaymentHistoryExpanded(false);
      setFormData({
        amount: '', payment_type: 'REGULAR', payment_method: 'Cash',
        payment_date: new Date().toISOString().split('T')[0],
        bank_account_id: accounts[0]?.id?.toString() || '', payment_reference: '',
      });
    }
  }, [open, selectedBooking, accounts]);

  if (!open || !selectedBooking) return null;

  const items = selectedBooking.items || [];
  const isFirstPayment = payments.length === 0 && Number(selectedBooking.paid_amount) <= 0;
  const mostRecent = payments[payments.length - 1];
  const isCancelled = selectedBooking.delivery_status === 'Cancelled';
  const hasPayments = Number(selectedBooking.paid_amount) > 0;
  const canEditFinancials = !hasPayments;
  const canEditUnitAmount = !hasPayments;

  const calculateFinancials = () => {
    const baseAmount = editedItems.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const amount = Number(item.unit_amount) || 0;
      return sum + (qty * amount);
    }, 0);
    const deliveryCharges = Number(editedFinancials.delivery_charges) || 0;
    const taxableAmount = baseAmount + deliveryCharges;
    const cgst = taxableAmount * (Number(editedFinancials.cgst_percent) || 0) / 100;
    const sgst = taxableAmount * (Number(editedFinancials.sgst_percent) || 0) / 100;
    const totalAmount = taxableAmount + cgst + sgst;
    return { baseAmount, deliveryCharges, taxableAmount, cgst, sgst, totalAmount };
  };

  const financials = calculateFinancials();

  const hasPaymentToSave = Number(formData.amount) > 0 && Number(selectedBooking.remaining_amount) > 0;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setErrorMessage(null);
    try {
      if (pendingUndoPayment) {
        await onDeletePayment(pendingUndoPayment);
      }

      if (isEditingFinancials && canEditFinancials) {
        const hasUnitAmountChanges = editedItems.some((item, idx) =>
          Number(item.unit_amount) !== Number(items[idx].unit_amount)
        );

        const hasFinancialChanges =
          Number(editedFinancials.delivery_charges) !== Number(selectedBooking.delivery_charges) ||
          Number(editedFinancials.cgst_percent) !== Number(selectedBooking.cgst_percent) ||
          Number(editedFinancials.sgst_percent) !== Number(selectedBooking.sgst_percent);

        if (hasUnitAmountChanges || hasFinancialChanges) {
          const payload: any = {};

          if (hasUnitAmountChanges) {
            payload.items = editedItems.map((item) => ({
              plant_name: item.plant_name,
              unit_amount: Number(item.unit_amount),
            }));
          }

          if (hasFinancialChanges) {
            payload.delivery_charges = Number(editedFinancials.delivery_charges);
            payload.cgst_percent = Number(editedFinancials.cgst_percent);
            payload.sgst_percent = Number(editedFinancials.sgst_percent);
          }

          await customerBookingsApi.updateInstantSale(selectedBooking.order_id, payload);
          if (onUpdate) await onUpdate();
        }
      }

      if (hasPaymentToSave) {
        const paymentPayload = { ...formData };
        if (paymentPayload.payment_method === 'Cash') paymentPayload.bank_account_id = '';
        await onAddPayment(paymentPayload);
      }
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update');
    }
  };

  const handleUndoPayment = () => {
    if (!mostRecent) return;
    if (pendingUndoPayment === mostRecent.transaction_number) {
      setPendingUndoPayment(null);
    } else {
      setPendingUndoPayment(mostRecent.transaction_number);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await onCancelBooking(cancellationReason || undefined);
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to cancel booking');
    }
  };

  const handleDownloadBill = async () => {
    try {
      await billingApi.downloadBill(selectedBooking.order_id);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to download invoice';
      setErrorMessage(errorMsg);
      console.error('Download error:', err);
    }
  };

  const getUnitLabel = (item: any) =>
    item.stock_source === 'STOCK_FROM_OUTDOOR' ? 'plants' : 'bottles';

  // ── Cancel confirmation screen ───────────────────────────────────────────────

  if (showCancelConfirm && !isCancelled) {
    return (
      <ModalLayout title="Cancel Instant Sale" width="w-[700px]">
        <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="space-y-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-base text-red-700">Cancel Sale {selectedBooking.order_id}?</h3>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="text-base font-medium border-slate-300 text-slate-600">{selectedBooking.order_id}</Badge>
              <span className="text-base text-slate-600 font-medium ml-2">{selectedBooking.customer_name}</span>
            </div>
            {Number(selectedBooking.paid_amount) > 0 && (
              <p className="text-base text-red-600">
                A refund of <span className="font-bold">₹{Number(selectedBooking.paid_amount).toLocaleString()}</span> will be created automatically.
              </p>
            )}
            <div className="space-y-2">
              <Label>Cancellation Reason (Optional)</Label>
              <Textarea
                placeholder="Why is this sale being cancelled?"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="text-base border-red-200 focus:border-red-400 min-h-[80px]"
              />
            </div>
            {errorMessage && (
              <div className="bg-red-100 border border-red-300 rounded p-2 text-base text-red-700 flex items-start gap-1">
                <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                <span className="flex-1">{errorMessage}</span>
                <button type="button" onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-700 ml-1 shrink-0">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setShowCancelConfirm(false); setCancellationReason(''); setErrorMessage(null); }}>
              Go Back
            </Button>
            <Button onClick={handleCancelBooking} className="bg-red-600 hover:bg-red-700">
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </ModalLayout>
    );
  }

  // ── Main dialog ──────────────────────────────────────────────────────────────

  return (
    <ModalLayout title="Manage Instant Sale" width="w-[700px]">
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>

        {/* Order ID + customer */}
        <div className="flex items-center gap-2 -mt-2">
          <Badge variant="outline" className="text-base font-medium border-slate-300 text-slate-600">{selectedBooking.order_id}</Badge>
          <span className="text-base text-slate-600 font-medium">{selectedBooking.customer_name}</span>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-base text-red-700 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-700 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Sale Items ────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base text-slate-900">Sale Items</h3>
            {canEditUnitAmount && isEditingFinancials && (
              <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <PenSquare className="h-3 w-3" /> Unit amounts editable
              </span>
            )}
          </div>

          {items.map((item: any, itemIdx: number) => {
            const unitLabel = getUnitLabel(item);
            console.log('Item data:', item); // DEBUG: Check if batch_code exists

            return (
              <div
                key={itemIdx}
                className={cn(
                  'border rounded-md p-4 shadow-sm bg-white space-y-3 transition-colors',
                  isEditingFinancials && canEditUnitAmount && 'border-amber-200',
                )}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-base">Item {item.item_number || itemIdx + 1}</h4>
                  <Badge
                    variant="outline"
                    className={item.stock_source === 'STOCK_FROM_OUTDOOR'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'}
                  >
                    {item.stock_source === 'STOCK_FROM_OUTDOOR' 
                      ? `Outdoor - ${item.source_phase || 'Unknown'}` 
                      : `Indoor - ${item.source_phase || 'Unknown'}`}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-base text-gray-500 mb-1 font-medium">Plant Name</p>
                    <p className="text-base font-semibold text-gray-900">{item.plant_name}</p>
                  </div>

                  <div className="border-l pl-4">
                    <p className="text-base text-gray-500 mb-1 font-medium">Stage</p>
                    <p className="text-base font-semibold text-gray-900">
                      {item.stock_source === 'STOCK_FROM_INDOOR' && item.source_stage && item.source_phase === 'Incubation'
                        ? item.source_stage
                        : '—'}
                    </p>
                  </div>

                  {/* Quantity — always read-only for instant sale */}
                  <div className="border-l pl-4">
                    <p className="text-base text-gray-500 mb-1 font-medium">Quantity</p>
                    <p className="text-base font-semibold text-gray-900">
                      {item.quantity} <span className="text-gray-600 font-normal">{unitLabel}</span>
                    </p>
                  </div>

                  <div className="border-l pl-4">
                    <p className="text-base text-gray-500 mb-1 font-medium">Unit Amount</p>
                    {isEditingFinancials && canEditUnitAmount ? (
                      <>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">₹</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editedItems[itemIdx]?.unit_amount ?? item.unit_amount}
                            onChange={(e) => {
                              const updated = [...editedItems];
                              updated[itemIdx] = {
                                ...item,
                                ...updated[itemIdx],
                                unit_amount: e.target.value,
                                plant_name: item.plant_name,
                                quantity: item.quantity,
                              };
                              setEditedItems(updated);
                            }}
                            className="h-7 pl-6 text-sm font-semibold"
                          />
                        </div>
                        <p className="text-xs text-amber-600 font-medium mt-0.5 tabular-nums">
                          = ₹{(Number(item.quantity) * Number(editedItems[itemIdx]?.unit_amount ?? item.unit_amount)).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <p className="text-base font-semibold text-gray-900">₹{Number(item.unit_amount).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {item.batch_code && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-base text-gray-500 mb-1 font-medium">Batch Code</p>
                    <p className="text-base font-semibold text-blue-700 font-mono">{item.batch_code}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Financial Breakdown ─────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base text-slate-900">Financial Breakdown</h3>
            {canEditFinancials && (
              <button
                type="button"
                onClick={() => setIsEditingFinancials(v => !v)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors border',
                  isEditingFinancials
                    ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                )}
              >
                {isEditingFinancials
                  ? <><X className="h-3.5 w-3.5" /> Cancel editing</>
                  : <><PenSquare className="h-3.5 w-3.5" /> Edit</>}
              </button>
            )}
          </div>

          <div className={cn(
            'border rounded-md overflow-hidden transition-colors',
            isEditingFinancials ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200',
          )}>
            <div className="divide-y divide-slate-100">

              {/* Delivery Date — read-only */}
              <div className="flex items-center justify-between px-4 py-3 gap-4">
                <span className="text-sm text-slate-500 shrink-0">Delivery Date</span>
                <span className="text-sm font-semibold text-slate-900">
                  {selectedBooking.expected_delivery_date
                    ? format(new Date(selectedBooking.expected_delivery_date), 'do MMM yyyy')
                    : '—'}
                </span>
              </div>

              {/* Base Amount — read-only, derived */}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-500">Base Amount</span>
                <span className="text-sm font-semibold text-slate-900">₹{financials.baseAmount.toLocaleString()}</span>
              </div>

              {/* Delivery Charges */}
              <div className="flex items-center justify-between px-4 py-3 gap-4">
                <span className="text-sm text-slate-500 shrink-0">Delivery Charges</span>
                {isEditingFinancials ? (
                  <div className="relative w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">₹</span>
                    <Input
                      type="number"
                      value={editedFinancials.delivery_charges}
                      onChange={(e) => setEditedFinancials({ ...editedFinancials, delivery_charges: e.target.value })}
                      className="h-8 pl-6 text-sm text-right"
                      placeholder="0"
                    />
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-slate-900">₹{financials.deliveryCharges.toLocaleString()}</span>
                )}
              </div>

              {/* CGST */}
              <div className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-slate-500">CGST</span>
                  {!isEditingFinancials && (
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                      {editedFinancials.cgst_percent || 0}%
                    </span>
                  )}
                </div>
                {isEditingFinancials ? (
                  <div className="flex items-center gap-2">
                    <div className="relative w-24">
                      <Input
                        type="number"
                        value={editedFinancials.cgst_percent}
                        onChange={(e) => setEditedFinancials({ ...editedFinancials, cgst_percent: e.target.value })}
                        className="h-8 pr-7 text-sm text-right"
                        placeholder="0"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">%</span>
                    </div>
                    <span className="text-sm text-slate-400 w-28 text-right tabular-nums">
                      = ₹{financials.cgst.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-slate-900">₹{financials.cgst.toLocaleString()}</span>
                )}
              </div>

              {/* SGST */}
              <div className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-slate-500">SGST</span>
                  {!isEditingFinancials && (
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                      {editedFinancials.sgst_percent || 0}%
                    </span>
                  )}
                </div>
                {isEditingFinancials ? (
                  <div className="flex items-center gap-2">
                    <div className="relative w-24">
                      <Input
                        type="number"
                        value={editedFinancials.sgst_percent}
                        onChange={(e) => setEditedFinancials({ ...editedFinancials, sgst_percent: e.target.value })}
                        className="h-8 pr-7 text-sm text-right"
                        placeholder="0"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">%</span>
                    </div>
                    <span className="text-sm text-slate-400 w-28 text-right tabular-nums">
                      = ₹{financials.sgst.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-slate-900">₹{financials.sgst.toLocaleString()}</span>
                )}
              </div>

            </div>

            {/* Total footer */}
            <div className={cn(
              'flex items-center justify-between px-4 py-3 border-t',
              isEditingFinancials ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200',
            )}>
              <span className={cn('text-sm font-semibold', isEditingFinancials ? 'text-amber-800' : 'text-slate-700')}>
                {isEditingFinancials ? 'Calculated Total' : 'Total'}
              </span>
              <span className={cn('text-sm font-semibold tabular-nums', isEditingFinancials ? 'text-amber-700' : 'text-slate-900')}>
                ₹{financials.totalAmount.toLocaleString()}
              </span>
            </div>

            {/* Payment summary rows */}
            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-500">Total Paid</span>
                <span className="text-sm font-semibold text-green-600">₹{Number(selectedBooking.paid_amount).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                <span className="text-sm font-semibold text-slate-700">Balance Due</span>
                <span className="text-sm font-semibold text-red-600 tabular-nums">
                  ₹{(financials.totalAmount - Number(selectedBooking.paid_amount)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Payment History ──────────────────────────────────────────────────── */}
        <div className="border border-slate-200 rounded-md overflow-hidden">
          {/* Clickable header */}
          <button
            type="button"
            onClick={() => setIsPaymentHistoryExpanded(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <HistoryIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-sm font-semibold text-slate-700">Payment History</span>
                {payments.length > 0 ? (
                  <span className="ml-2 text-xs font-medium text-slate-400">
                    {payments.length} transaction{payments.length > 1 ? 's' : ''}
                    {' · '}
                    <span className="text-green-600 font-semibold">₹{Number(selectedBooking.paid_amount).toLocaleString()} paid</span>
                  </span>
                ) : (
                  <span className="ml-2 text-xs text-slate-400">No transactions yet</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pendingUndoPayment && (
                <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5">
                  Undo pending
                </span>
              )}
              {isPaymentHistoryExpanded
                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {/* Expanded transactions */}
          {isPaymentHistoryExpanded && (
            <div className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <HistoryIcon className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm font-medium">No payments recorded yet</p>
                  <p className="text-xs mt-0.5">Payments will appear here once added</p>
                </div>
              ) : (
                [...payments].reverse().map((payment, idx) => {
                  const isLatest = idx === 0;
                  const isAdvance = payment.entry_type === 'ADVANCE_RECEIVED';
                  const isPendingUndo = pendingUndoPayment === payment.transaction_number;

                  return (
                    <div
                      key={payment.transaction_number}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 transition-colors',
                        isPendingUndo ? 'bg-red-50' : 'bg-white hover:bg-slate-50',
                      )}
                    >
                      {/* Color bar */}
                      <div className={cn(
                        'w-1 self-stretch rounded-full shrink-0',
                        isPendingUndo ? 'bg-red-300' : isAdvance ? 'bg-purple-300' : 'bg-green-300',
                      )} />

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-slate-900 tabular-nums">
                            ₹{Number(payment.credit_amount).toLocaleString()}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {payment.payment_method}
                          </span>
                          {isAdvance && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              Advance
                            </span>
                          )}
                          {isLatest && !isAdvance && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Latest
                            </span>
                          )}
                          {isPendingUndo && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                              Will be undone
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs text-slate-400">
                            {format(new Date(payment.entry_date), 'do MMM yyyy')}
                          </span>
                          {payment.transaction_number && (
                            <>
                              <span className="text-slate-200">·</span>
                              <span className="text-xs text-slate-400 font-mono truncate">
                                {payment.transaction_number}
                              </span>
                            </>
                          )}
                          {payment.payment_reference && (
                            <>
                              <span className="text-slate-200">·</span>
                              <span className="text-xs text-slate-400 truncate">
                                Ref: {payment.payment_reference}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Undo button — only on latest, non-cancelled */}
                      {isLatest && !isCancelled && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleUndoPayment(); }}
                          className={cn(
                            'shrink-0 flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors border',
                            isPendingUndo
                              ? 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50',
                          )}
                        >
                          <Trash2 className="h-3 w-3" />
                          {isPendingUndo ? 'Cancel' : 'Undo'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ── Payment / Cancelled / Complete section ───────────────────────────── */}
        {isCancelled ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center space-y-1">
            <XCircle className="h-6 w-6 text-red-400 mx-auto" />
            <p className="font-semibold text-base text-red-700">Sale Cancelled</p>
            {selectedBooking.cancellation_reason && (
              <p className="text-base text-red-500">Reason: {selectedBooking.cancellation_reason}</p>
            )}
          </div>
        ) : Number(selectedBooking.remaining_amount) <= 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-5 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
            <p className="font-semibold text-base text-green-800">Payment Complete</p>
            <p className="text-base text-green-600">This bill has been fully paid.</p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-md overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-700">Record New Payment</span>
              {isFirstPayment && (
                <div className="flex rounded overflow-hidden border border-slate-200 bg-white">
                  {[
                    { val: 'ADVANCE', label: 'Advance' },
                    { val: 'REGULAR', label: 'Regular' },
                  ].map(({ val, label }, i) => (
                    <button
                      key={val} type="button"
                      onClick={() => setFormData({ ...formData, payment_type: val })}
                      className={cn(
                        'px-3 py-1 text-xs font-medium transition-colors',
                        i > 0 && 'border-l border-slate-200',
                        formData.payment_type === val ? 'bg-green-600 text-white' : 'text-slate-500 hover:bg-slate-50',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="px-4 py-4 space-y-3 bg-white">
              {/* Amount + Method — same row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Amount (₹) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-slate-400 pointer-events-none">₹</span>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      className="pl-7 h-10 text-base font-bold text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(val: string) => setFormData({ ...formData, payment_method: val, bank_account_id: val === 'Cash' ? '' : formData.bank_account_id })}
                  >
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bank + Ref — only for non-cash */}
              {formData.payment_method !== 'Cash' && (
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Bank Account</Label>
                    <Select value={formData.bank_account_id} onValueChange={(val: string) => setFormData({ ...formData, bank_account_id: val })}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select account" /></SelectTrigger>
                      <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.bank_name} · {a.account_name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">TXN / Reference</Label>
                    <Input className="h-9 text-sm" placeholder="Ref ID" value={formData.payment_reference} onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────────── */}
      <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
        <div className="flex justify-between gap-3">
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              className="text-blue-600 border-blue-200 hover:bg-blue-50 text-base"
              onClick={handleDownloadBill}
            >
              <Download className="h-3 w-3 mr-1" /> Download Bill
            </Button>
            {!isCancelled && (
              <Button
                variant="outline" size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 text-base"
                onClick={() => { setErrorMessage(null); setShowCancelConfirm(true); }}
              >
                <XCircle className="h-3 w-3 mr-1" /> Cancel
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Dismiss</Button>
            {!isCancelled && (
              <Button
                onClick={handleSave}
                disabled={!hasPaymentToSave && !isEditingFinancials && !pendingUndoPayment}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirm & Save
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalLayout>
  );
};
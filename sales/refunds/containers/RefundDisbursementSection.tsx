import { RefundDisbursementTable } from '../components/RefundDisbursementTable';
import React, { useState } from 'react';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { useRefunds, useRefundDetail } from '../../hooks/useRefunds';
import { useBankAccounts } from '../../hooks/useBankAccounts';
import { PAYMENT_METHODS } from '../../constants/EventTypes';
import { useNotify } from '../../../shared/hooks/useNotify';
import { cn } from '../../../shared/ui/utils';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import {
  History as HistoryIcon,
  Banknote,
  Trash2,
  CheckCircle2,
  ArrowDownLeft
} from 'lucide-react';

const RefundDisbursementSection: React.FC = () => {
  const { refunds, pagination, refetch } = useRefunds();
  const { accounts } = useBankAccounts(true);
  const notify = useNotify();

  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { refund, createTerm, deleteTerm, refetch: refetchDetail } =
    useRefundDetail(selectedRefundId);

  const handlePageChange = (page: number) => {
    refetch(page);
  };

  const [termForm, setTermForm] = useState({
    amount: '',
    paymentMethod: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
    bankAccountId: '',
    transactionNumber: '',
    notes: ''
  });

  const handleOpenDetail = (record: any) => {
    setSelectedRefundId(record.refundId);
    setIsDetailOpen(true);
    setTermForm({
      amount: '',
      paymentMethod: 'Cash',
      paymentDate: new Date().toISOString().split('T')[0],
      bankAccountId: accounts[0]?.id?.toString() || '',
      transactionNumber: '',
      notes: ''
    });
  };

  const handleCreateTerm = async () => {
    if (!selectedRefundId || !termForm.amount) return;
    try {
      await createTerm({
        amount: parseFloat(termForm.amount),
        paymentDate: termForm.paymentDate,
        paymentMethod: termForm.paymentMethod,
        bankAccountId: termForm.paymentMethod === 'Cash' ? undefined : parseInt(termForm.bankAccountId) || undefined,
        paymentReference: termForm.transactionNumber || undefined,
        notes: termForm.notes || undefined
      });
      notify.success('Refund term recorded');
      await refetchDetail();
      await refetch();
      setTermForm(f => ({ ...f, amount: '', transactionNumber: '', notes: '' }));
    } catch (err: any) {
      notify.error(err.message || 'Failed to record refund term');
    }
  };

  const handleDeleteTerm = async (termNumber: number) => {
    if (!confirm(`Undo refund term #${termNumber}? This will reverse the fund exit.`)) return;
    try {
      await deleteTerm(termNumber);
      notify.success(`Refund term #${termNumber} undone`);
      refetchDetail();
      refetch();
    } catch (err: any) {
      notify.error(err.message || 'Failed to undo refund term');
    }
  };

  const columns = [
    { key: 'refundId', label: 'Refund ID' },
    { key: 'orderId', label: 'Booking ID' },
    { key: 'customerName', label: 'Customer' },
    {
      key: 'phoneNumber',
      label: 'Phone',
      render: (val: string) => val || '—'
    },
    {
      key: 'refundAmount',
      label: 'Refund Amount',
      render: (val: number) => `₹${Number(val).toLocaleString()}`
    },
    {
      key: 'amountPaid',
      label: 'Disbursed',
      render: (val: number) => `₹${Number(val).toLocaleString()}`
    },
    {
      key: 'amountRemaining',
      label: 'Remaining',
      render: (val: number) => `₹${Number(val || 0).toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (val: string) => {
        const styles: Record<string, string> = {
          'Pending': 'bg-amber-100 text-amber-700',
          'Partial': 'bg-blue-100 text-blue-700',
          'Completed': 'bg-emerald-100 text-emerald-700',
        };
        return <Badge className={styles[val] || 'bg-slate-100 text-slate-500'}>{val}</Badge>;
      }
    },
    {
      key: 'termCount',
      label: 'Terms',
      render: (val: number) => val || '0'
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (val: string) => val ? format(new Date(val), 'dd MMM yyyy') : '—'
    }
  ];

  const latestTerm = refund?.payments?.[refund.payments.length - 1];

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="refunds" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="refunds">Refund Disbursements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="refunds">
          <RefundDisbursementTable
            title="Refund Disbursements"

            columns={columns}
            records={refunds}
            onEdit={handleOpenDetail}
            filterConfig={{
              filter1Key: 'customerName',
              filter1Label: 'Search customer...',
              filter2Key: 'refundId',
              filter2Label: 'Refund ID'
            }}
            exportFileName="refund_disbursements"
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

      {/* Refund Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="pb-2 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <ArrowDownLeft className="h-5 w-5 text-red-600" />
                Refund Disbursement
              </DialogTitle>
              {refund && (
                <div className="text-right">
                  <p className="text-base text-gray-500">Remaining</p>
                  <p className={`text-xl font-bold ${Number(refund.amountRemaining || 0) > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    ₹{Number(refund.amountRemaining || 0).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            {refund && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-base bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                  {refund.refundId}
                </span>
                <span className="text-base bg-red-50 text-red-600 px-2 py-0.5 rounded font-medium">
                  Booking {refund.orderId}
                </span>
                <span className="text-base text-gray-500">{refund.customerName}</span>
              </div>
            )}
          </DialogHeader>

          {!refund ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-5 max-h-[60vh] overflow-y-auto py-2">

              {/* Refund Summary */}
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-red-400 uppercase font-bold">Total Refund</p>
                  <p className="text-base font-bold text-red-700">₹{Number(refund.refundAmount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-green-400 uppercase font-bold">Disbursed</p>
                  <p className="text-base font-bold text-green-700">₹{Number(refund.amountPaid || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-amber-400 uppercase font-bold">Remaining</p>
                  <p className="text-base font-bold text-amber-700">₹{Number(refund.amountRemaining || 0).toLocaleString()}</p>
                </div>
              </div>

              {refund.refundReason && (
                <div className="text-base text-gray-500 bg-gray-50 rounded-lg p-3">
                  <span className="font-semibold">Reason:</span> {refund.refundReason}
                </div>
              )}

              {/* Payment Terms History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base text-gray-700 flex items-center gap-1.5">
                    <HistoryIcon className="h-4 w-4" /> Disbursement Terms
                  </h3>
                  {refund.payments.length > 0 && (
                    <span className="text-base text-gray-400">
                      {refund.payments.length} term{refund.payments.length > 1 ? 's' : ''} · ₹{Number(refund.amountPaid || 0).toLocaleString()} disbursed
                    </span>
                  )}
                </div>

                {refund.payments.length === 0 ? (
                  <div className="text-center py-4 text-base text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                    No disbursements recorded yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...refund.payments].reverse().map((payment, idx) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 flex items-center justify-center bg-white rounded-md border border-gray-200 text-gray-500 shrink-0 text-base font-bold">
                            #{payment.refundTermNo}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-base text-gray-800">₹{Number(payment.debitAmount).toLocaleString()}</span>
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-medium">{payment.paymentMethod}</Badge>
                              {idx === 0 && (
                                <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Latest</span>
                              )}
                            </div>
                            <p className="text-base text-gray-400 mt-0.5">
                              {format(new Date(payment.entryDate), 'do MMM yyyy')}
                              {payment.transactionNumber && <span className="ml-2">TXN: {payment.transactionNumber}</span>}
                            </p>
                          </div>
                        </div>
                        {idx === 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-red-600 border-red-200 hover:bg-red-50 text-base font-medium"
                            onClick={() => handleDeleteTerm(payment.refundTermNo)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Undo
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Record New Disbursement or Completed Banner */}
              {Number(refund.amountRemaining || 0) <= 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                  <p className="font-semibold text-base text-green-800">Refund Complete</p>
                  <p className="text-base text-green-600">All refund terms have been disbursed.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-base text-gray-700 flex items-center gap-1.5">
                    <Banknote className="h-4 w-4" /> Record Disbursement Term
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Disbursement Amount (₹) *</Label>
                      <Input
                        type="number"
                        value={termForm.amount}
                        onChange={(e) => setTermForm({ ...termForm, amount: e.target.value })}
                        placeholder="0.00"
                        className="text-base font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={termForm.paymentDate}
                        onChange={(e) => setTermForm({ ...termForm, paymentDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select
                        value={termForm.paymentMethod}
                        onValueChange={(val) =>
                          setTermForm({ ...termForm, paymentMethod: val, bankAccountId: val === 'Cash' ? '' : termForm.bankAccountId })
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {termForm.paymentMethod !== 'Cash' && (
                      <>
                        <div className="space-y-2">
                          <Label>Bank Account</Label>
                          <Select
                            value={termForm.bankAccountId}
                            onValueChange={(val) => setTermForm({ ...termForm, bankAccountId: val })}
                          >
                            <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                            <SelectContent>
                              {accounts.map(a => (
                                <SelectItem key={a.id} value={String(a.id)}>{a.bankName} · {a.accountName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>TXN / Reference</Label>
                          <Input
                            placeholder="Ref ID"
                            value={termForm.transactionNumber}
                            onChange={(e) => setTermForm({ ...termForm, transactionNumber: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    <div className="col-span-2 space-y-2">
                      <Label>Notes</Label>
                      <Input
                        placeholder="Optional notes"
                        value={termForm.notes}
                        onChange={(e) => setTermForm({ ...termForm, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      disabled={!termForm.amount || Number(termForm.amount) <= 0}
                      onClick={handleCreateTerm}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Disburse ₹{termForm.amount ? Number(termForm.amount).toLocaleString() : '0'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefundDisbursementSection;
export { RefundDisbursementSection };

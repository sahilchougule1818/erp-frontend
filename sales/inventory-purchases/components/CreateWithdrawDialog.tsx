import React, { useState } from 'react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Button } from '../../../shared/ui/button';
import { PAYMENT_METHODS } from '../../constants/EventTypes';
import { useNotify } from '../../../shared/hooks/useNotify';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: any[];
  suppliers: any[];
  accounts: any[];
  onSubmit: (payload: any) => Promise<void>;
}

export const CreateWithdrawDialog: React.FC<Props> = ({
  open, onOpenChange, items, suppliers, accounts, onSubmit,
}) => {
  const notify = useNotify();
  const [formData, setFormData] = useState({
    item_id: '',
    supplier_id: 'none',
    quantity: '',
    purpose: '',
    notes: '',
    amount: '',
    withdraw_date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    bank_account_id: '',
    payment_reference: ''
  });

  const handleSubmit = async () => {
    if (!formData.item_id || !formData.purpose || !formData.amount) {
      notify.error('Please fill all required fields');
      return;
    }
    const payload = {
      ...formData,
      item_id: parseInt(formData.item_id),
      supplier_id: formData.supplier_id === 'none' ? null : parseInt(formData.supplier_id),
      quantity: formData.quantity ? parseFloat(formData.quantity) : null,
      amount: parseFloat(formData.amount),
      bank_account_id: formData.payment_method === 'Cash' ? null : parseInt(formData.bank_account_id),
    };
    await onSubmit(payload);
    onOpenChange(false);
    setFormData({
      item_id: '', supplier_id: 'none', quantity: '', purpose: '', notes: '',
      amount: '', withdraw_date: new Date().toISOString().split('T')[0],
      payment_method: 'Cash', bank_account_id: '', payment_reference: ''
    });
  };

  if (!open) return null;

  return (
    <ModalLayout title="Record Expenditure">
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <p className="text-base text-gray-500 -mt-2">
          Debit entries will be automatically synced with the ledger.
        </p>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Expense Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category / Item *</Label>
              <Select value={formData.item_id} onValueChange={(val) => setFormData({ ...formData, item_id: val })}>
                <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                <SelectContent>
                  {items.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.name} ({i.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={formData.supplier_id} onValueChange={(val) => setFormData({ ...formData, supplier_id: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / Local / Direct</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input 
                type="number" 
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g. 50"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Reason / Purpose *</Label>
              <Input 
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Describe withdrawal reason"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Additional Notes</Label>
              <Input 
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Payment Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount Paid (₹) *</Label>
              <Input 
                type="number" 
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input 
                type="date"
                value={formData.withdraw_date}
                onChange={(e) => setFormData({ ...formData, withdraw_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select value={formData.payment_method} onValueChange={(val) => setFormData({ ...formData, payment_method: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.payment_method !== 'Cash' && (
              <div className="space-y-2">
                <Label>Debit Account</Label>
                <Select value={formData.bank_account_id} onValueChange={(val) => setFormData({ ...formData, bank_account_id: val })}>
                  <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>
                    {accounts.filter((a) => a.is_active).map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.account_name} ({a.bank_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="col-span-2 space-y-2">
              <Label>Internal Ref / TXN #</Label>
              <Input 
                value={formData.payment_reference}
                onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                placeholder="Reference number"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">Save Record</Button>
        </div>
      </div>
    </ModalLayout>
  );
};

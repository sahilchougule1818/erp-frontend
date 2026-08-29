import React, { useState, useEffect } from 'react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Button } from '../../../shared/ui/button';
import { BankAccount, bankAccountsApi } from '../../api/salesApi';
import { useNotify } from '../../../shared/hooks/useNotify';

interface Props {
  account: BankAccount | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}

const EditBankAccountDialog: React.FC<Props> = ({ account, open, onOpenChange, onSuccess }) => {
  const notify = useNotify();
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    branch: '',
    ifscCode: '',
    isActive: true
  });

  useEffect(() => {
    if (account) {
      setFormData({
        accountName: account.accountName || '',
        accountNumber: account.accountNumber || '',
        bankName: account.bankName || '',
        branch: account.branch || '',
        ifscCode: account.ifscCode || '',
        isActive: account.isActive !== false
      });
    }
  }, [account]);

  const handleSubmit = async () => {
    if (!account) return;
    if (!formData.accountName || !formData.accountNumber || !formData.bankName) {
      notify.error('Please fill all required fields');
      return;
    }
    try {
      await bankAccountsApi.update(account.id, formData);
      notify.success('Account updated');
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      notify.error(err.message || 'Update failed');
    }
  };

  if (!open || !account) return null;

  return (
    <ModalLayout title="Edit Bank Account">
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Account Identity</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name *</Label>
              <Input 
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number *</Label>
              <Input 
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Bank Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Bank Name *</Label>
              <Input 
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input 
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>IFSC Code</Label>
              <Input 
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Status</p>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <Label htmlFor="isActive" className="cursor-pointer">Account is operational</Label>
          </div>
        </div>
      </div>
      
      <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">Save Changes</Button>
        </div>
      </div>
    </ModalLayout>
  );
};

export default EditBankAccountDialog;

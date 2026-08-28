import React, { useState } from 'react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Button } from '../../../shared/ui/button';
import { bankAccountsApi } from '../../services/salesApi';
import { useNotify } from '../../../shared/hooks/useNotify';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}

const CreateBankAccountDialog: React.FC<Props> = ({ open, onOpenChange, onSuccess }) => {
  const notify = useNotify();
  const [formData, setFormData] = useState({
    account_name: '',
    account_number: '',
    bank_name: '',
    branch: '',
    ifsc_code: ''
  });

  const handleSubmit = async () => {
    if (!formData.account_name || !formData.account_number || !formData.bank_name) {
      notify.error('Please fill all required fields');
      return;
    }
    try {
      await bankAccountsApi.create(formData);
      notify.success('Bank account registered');
      onOpenChange(false);
      onSuccess();
      setFormData({ account_name: '', account_number: '', bank_name: '', branch: '', ifsc_code: '' });
    } catch (err: any) {
      notify.error(err.message || 'Failed to create account');
    }
  };

  if (!open) return null;

  return (
    <ModalLayout title="Register Bank Account">
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Account Identity</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name *</Label>
              <Input 
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                placeholder="e.g. Main Savings"
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number *</Label>
              <Input 
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="e.g. 00112233445566"
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
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="SBI / HDFC / ICICI"
              />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input 
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="Main Branch"
              />
            </div>
            <div className="space-y-2">
              <Label>IFSC Code</Label>
              <Input 
                value={formData.ifsc_code}
                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                placeholder="SBIN0001234"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">Register Account</Button>
        </div>
      </div>
    </ModalLayout>
  );
};

export default CreateBankAccountDialog;

import React from 'react';
import { SharedForm, FieldConfig } from '../../components/SharedForm';
import { PAYMENT_METHODS } from '../../constants/EventTypes';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdraw: any;
  items: any[];
  suppliers: any[];
  accounts: any[];
  onSubmit: (id: string, payload: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const EditWithdrawDialog: React.FC<Props> = ({
  open, onOpenChange, withdraw, items, suppliers, accounts, onSubmit, onDelete
}) => {
  if (!withdraw) return null;

  const fields: FieldConfig[] = [
    {
      name: 'item_id',
      label: 'Category / Item',
      type: 'select',
      options: items.map(i => ({ value: String(i.id), label: `${i.name} (${i.unit})` })),
      required: true
    },
    {
      name: 'supplier_id',
      label: 'Supplier',
      type: 'select',
      options: [
        { value: 'none', label: 'None / Local / Direct' },
        ...suppliers.map(s => ({ value: String(s.id), label: s.name }))
      ]
    },
    {
      name: 'quantity',
      label: 'Quantity',
      type: 'number',
      step: 0.01,
      min: 0,
      placeholder: 'e.g. 50'
    },
    {
      name: 'purpose',
      label: 'Reason / Purpose',
      type: 'text',
      placeholder: 'Describe withdrawal reason',
      required: true,
      gridColumn: 'col-span-2'
    },
    {
      name: 'notes',
      label: 'Additional Notes',
      type: 'text',
      placeholder: 'Any additional notes...',
      gridColumn: 'col-span-2'
    },
    {
      name: 'amount',
      label: 'Amount Paid (₹)',
      type: 'number',
      step: 0.01,
      placeholder: '0.00',
      required: true
    },
    {
      name: 'withdraw_date',
      label: 'Payment Date',
      type: 'date'
    },
    {
      name: 'payment_method',
      label: 'Payment Mode',
      type: 'select',
      options: PAYMENT_METHODS.map(m => ({ value: m, label: m }))
    },
    {
      name: 'bank_account_id',
      label: 'Debit Account',
      type: 'select',
      options: accounts.filter(a => a.is_active).map(a => ({
        value: String(a.id),
        label: `${a.account_name} (${a.bank_name})`
      })),
      showWhen: (values) => values.payment_method !== 'Cash'
    },
    {
      name: 'transaction_number',
      label: 'Internal Ref / TXN #',
      type: 'text',
      placeholder: 'Reference number',
      gridColumn: 'col-span-2'
    }
  ];

  const sections = [
    {
      title: 'Expense Details',
      fields: ['item_id', 'supplier_id', 'quantity', 'purpose', 'notes']
    },
    {
      title: 'Payment Details',
      fields: ['amount', 'withdraw_date', 'payment_method', 'bank_account_id', 'transaction_number']
    }
  ];

  const defaultValues = {
    item_id: String(withdraw.item_id),
    supplier_id: withdraw.supplier_id ? String(withdraw.supplier_id) : 'none',
    quantity: withdraw.quantity ? String(withdraw.quantity) : '',
    amount: String(withdraw.amount),
    bank_account_id: withdraw.bank_account_id ? String(withdraw.bank_account_id) : '',
    payment_method: withdraw.payment_method,
    withdraw_date: format(new Date(withdraw.withdraw_date), 'yyyy-MM-dd'),
    transaction_number: withdraw.transaction_number || '',
    purpose: withdraw.purpose,
    notes: withdraw.notes || ''
  };

  const handleSubmit = async (data: any) => {
    const payload = {
      ...data,
      item_id: parseInt(data.item_id),
      supplier_id: data.supplier_id === 'none' ? null : parseInt(data.supplier_id),
      quantity: data.quantity ? parseFloat(data.quantity) : null,
      amount: parseFloat(data.amount),
      bank_account_id: data.payment_method === 'Cash' ? null : parseInt(data.bank_account_id)
    };
    await onSubmit(withdraw.purchase_id, payload);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (confirm('Permanently remove this withdrawal entry from the ledger?')) {
      await onDelete(withdraw.purchase_id);
      onOpenChange(false);
    }
  };

  return (
    <SharedForm
      open={open}
      title="Edit Expenditure"
      fields={fields}
      sections={sections}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onClose={() => onOpenChange(false)}
      onDelete={handleDelete}
      submitLabel="Save Changes"
      deleteLabel="Delete Entry"
      maxWidth="max-w-lg"
    />
  );
};

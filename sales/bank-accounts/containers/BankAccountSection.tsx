import React, { useState } from 'react';
import { useBankAccounts } from '../../hooks/useSalesApi';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { BankAccount, bankAccountsApi } from '../../services/salesApi';
import { Plus, Pencil, Trash2, Lock } from 'lucide-react';
import { DataTable } from '../../../shared/components/DataTable';
import { useNotify } from '../../../shared/hooks/useNotify';
import { cn } from '../../../shared/ui/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import CreateBankAccountDialog from '../components/CreateBankAccountDialog';
import EditBankAccountDialog from '../components/EditBankAccountDialog';

const BankAccountSection: React.FC = () => {
  const { accounts, refetch } = useBankAccounts(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const notify = useNotify();

  const hasTransactions = (a: BankAccount) =>
    Number(a.total_credits || 0) > 0 || Number(a.total_debits || 0) > 0;

  const handleDelete = async (account: BankAccount) => {
    if (!window.confirm(`Permanently delete "${account.account_name}"?`)) return;
    try {
      await bankAccountsApi.delete(account.id);
      notify.success('Account deleted');
      refetch();
    } catch (err: any) {
      notify.error(err.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'account_name', label: 'Account Name' },
    { key: 'bank_name', label: 'Bank' },
    {
      key: 'branch',
      label: 'Branch',
      render: (val: string) => val || 'Main Branch'
    },
    { key: 'account_number', label: 'Account No.' },
    {
      key: 'ifsc_code',
      label: 'IFSC',
      render: (val: string) => val || '—'
    },
    {
      key: 'total_credits',
      label: 'Funds In (₹)',
      render: (val: number) => `₹${Number(val).toLocaleString()}`
    },
    {
      key: 'total_debits',
      label: 'Funds Out (₹)',
      render: (val: number) => `₹${Number(val).toLocaleString()}`
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (val: boolean) => (
        <Badge variant="outline">
          {val ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: '_actions',
      label: 'Actions',
      render: (_: any, record: BankAccount) => {
        const locked = hasTransactions(record);
        return (
          <div className="flex items-center gap-1">
            {locked ? (
              <span className="flex items-center gap-1 text-base text-gray-400">
                <Lock className="h-3 w-3" /> Locked
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingAccount(record)}
                title="Edit account"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(record)}
              title="Delete account"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="p-6">
      <Tabs defaultValue="bank-accounts" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="bank-accounts">Bank Account Master</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bank-accounts">
          <DataTable
            title=""
            columns={columns}
            records={accounts}
            filterConfig={{
              filter1Key: 'bank_name',
              filter1Label: 'Bank',
              filter2Key: 'account_name',
              filter2Label: 'Search Account'
            }}
            addButton={
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white h-9"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1.5" /> Register Account
              </Button>
            }
            exportFileName="bank_accounts"
          />
        </TabsContent>
      </Tabs>

      <CreateBankAccountDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={refetch}
      />

      <EditBankAccountDialog
        account={editingAccount}
        open={!!editingAccount}
        onOpenChange={(v) => { if (!v) setEditingAccount(null); }}
        onSuccess={refetch}
      />
    </div>
  );
};

export default BankAccountSection;
export { BankAccountSection };

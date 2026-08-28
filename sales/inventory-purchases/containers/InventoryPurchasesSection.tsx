import React, { useState } from 'react';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useInventoryPayments, useInventoryItems, useWithdrawSuppliers, useBankAccounts } from '../../hooks/useSalesApi';
import { CreateWithdrawDialog } from '../components/CreateWithdrawDialog';
import { inventoryPaymentsApi, inventoryPurchasesApi } from '../../services/salesApi';
import { DataTable } from '../../../shared/components/DataTable';
import { useNotify } from '../../../shared/hooks/useNotify';
import { cn } from '../../../shared/ui/utils';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';

const InventoryPurchasesSection: React.FC = () => {
  const notify = useNotify();
  const { payments, pagination, refetch } = useInventoryPayments();
  const { items } = useInventoryItems();
  const { suppliers } = useWithdrawSuppliers();
  const { accounts } = useBankAccounts(true);
  const [createOpen, setCreateOpen] = useState(false);

  const handlePageChange = (page: number) => {
    refetch(page);
  };

  const handleCreate = async (payload: any) => {
    try {
      await inventoryPaymentsApi.create(payload);
      notify.success('Inventory purchase recorded successfully');
      refetch();
    } catch (err: any) {
      notify.error(err.message || 'Failed to record purchase');
      throw err;
    }
  };

  const handleDelete = async (record: any) => {
    if (!confirm(`Undo inventory purchase ${record.purchase_id}?\n\nThis will:\n- Reverse the stock addition\n- Reverse the financial transaction\n- Restore bank balance\n\nNote: Only the latest purchase for an item can be undone.`)) {
      return;
    }
    
    try {
      await inventoryPurchasesApi.delete(record.purchase_id);
      notify.success('Inventory purchase undone successfully');
      refetch();
    } catch (err: any) {
      notify.error(err.message || 'Failed to undo purchase');
    }
  };

  const columns = [
    { key: 'purchase_id', label: 'Purchase ID' },
    {
      key: 'purchase_date',
      label: 'Date',
      render: (val: string) => format(new Date(val), 'dd MMM yyyy')
    },
    {
      key: 'item_name',
      label: 'Item',
      render: (val: string, record: any) => (
        <div>
          <div>{val}</div>
          <div className="text-base text-gray-500">{record.unit}</div>
        </div>
      )
    },
    {
      key: 'supplier_name',
      label: 'Supplier',
      render: (val: string) => val || '—'
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (val: number) => Number(val).toLocaleString()
    },
    {
      key: 'payment_method',
      label: 'Payment',
      render: (val: string) => val ? (
        <Badge variant="outline">{val}</Badge>
      ) : '—'
    },
    {
      key: 'bank_account_name',
      label: 'Bank Account',
      render: (val: string, record: any) => val ? `${record.bank_name} - ${val}` : '—'
    },
    {
      key: 'price',
      label: 'Amount',
      render: (val: number) => `₹${Number(val).toLocaleString()}`
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, record: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(record);
          }}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Undo
        </Button>
      )
    }
  ];

  return (
    <div className="p-6">
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="purchases">Inventory Purchases</TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchases">
          <DataTable
            title=""

            columns={columns}
            records={payments}
            filterConfig={{
              filter1Key: 'item_name',
              filter1Label: 'Search item...',
              filter2Key: 'supplier_name',
              filter2Label: 'Supplier'
            }}
            exportFileName="inventory_purchases"
            addButton={
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Record Purchase
              </Button>
            }
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

      <CreateWithdrawDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        items={items}
        suppliers={suppliers}
        accounts={accounts}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default InventoryPurchasesSection;
export { InventoryPurchasesSection };

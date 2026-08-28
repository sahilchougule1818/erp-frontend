import { useState } from 'react';
import { MoreVertical, PackageMinus, Plus, RotateCcw } from 'lucide-react';
import { Badge } from '../../../shared/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '../../../shared/ui/dropdown-menu';
import { Button } from '../../../shared/ui/button';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { DataTable } from '../../../shared/components/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { inventoryApi } from '../../services/inventoryApi';
import { useNotify } from '../../../shared/hooks/useNotify';

type Item = { 
  id: number; 
  name: string; 
  unit: string; 
  min_stock: number;
  current_stock: number;
  last_withdrawal_id: number | null;
  last_withdrawal_quantity: number | null;
  last_withdrawal_date: string | null;
};

type Props = {
  items: Item[];
  onStockAdded: () => void;
  onItemAdded: () => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
  };
};

const UNITS = ['kg', 'bags', 'pcs', 'ltr', 'bundles'];

export function InventoryUpdateTab({ items, onStockAdded, onItemAdded, pagination }: Props) {
  const notify = useNotify();
  const [withdrawItem, setWithdrawItem] = useState<Item | null>(null);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [itemForm, setItemForm] = useState({ name: '', unit: '', min_stock: '' });
  const [saving, setSaving] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ quantity: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [withdrawSaving, setWithdrawSaving] = useState(false);

  const handleUndoLastWithdrawal = async (item: Item) => {
    if (!item.last_withdrawal_id) {
      notify.error('No withdrawal to undo');
      return;
    }
    const detail = `${Number(item.last_withdrawal_quantity).toLocaleString()} ${item.unit}`;
    if (!confirm(`Undo last withdrawal for "${item.name}"?\n\nStock Withdrawn — ${detail}\n\nThis cannot be reversed.`)) return;
    try {
      await inventoryApi.stockUsage.undoLast(item.id);
      notify.success(`Undone: Stock Withdrawn of ${detail}`);
      onStockAdded();
    } catch (err: any) {
      notify.error(err.message || 'Failed to undo');
    }
  };

  const handleWithdrawStock = async () => {
    if (!withdrawItem || !withdrawForm.quantity) { notify.error('Quantity is required'); return; }
    setWithdrawSaving(true);
    try {
      await inventoryApi.stockUsage.create({
        item_id: withdrawItem.id,
        quantity: parseFloat(withdrawForm.quantity),
        date: withdrawForm.date,
        notes: withdrawForm.notes || null,
      });
      notify.success(`Usage logged for ${withdrawItem.name}`);
      onStockAdded();
      setWithdrawItem(null);
    } catch (err: any) {
      notify.error(err.message || 'Failed to log withdrawal');
    } finally {
      setWithdrawSaving(false);
    }
  };

  const handleSaveItem = async () => {
    if (!itemForm.name || !itemForm.unit) { notify.error('Item name and unit are required'); return; }
    setSaving(true);
    try {
      await inventoryApi.items.create({
        name: itemForm.name,
        unit: itemForm.unit,
        min_stock: itemForm.min_stock ? parseFloat(itemForm.min_stock) : 0,
      });
      notify.success(`Item "${itemForm.name}" added`);
      setItemForm({ name: '', unit: '', min_stock: '' });
      setAddItemOpen(false);
      onItemAdded();
    } catch (err: any) {
      notify.error(err.message || 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  // Build records with computed fields for DataTable
  const records = items.map(item => {
    const current_stock = item.current_stock || 0;
    const is_low = current_stock <= item.min_stock;
    return { ...item, current_stock, is_low };
  });

  const columns = [
    {
      key: 'name',
      label: 'Item',
      render: (val: string) => <span>{val}</span>
    },
    { key: 'unit', label: 'Unit' },
    { key: 'min_stock', label: 'Min Stock' },
    { key: 'current_stock', label: 'Current Stock' },
    {
      key: 'id',
      label: '',
      render: (_: any, record: any) => {
        const item: Item = { 
          id: record.id, 
          name: record.name, 
          unit: record.unit, 
          min_stock: record.min_stock,
          current_stock: record.current_stock || 0,
          last_withdrawal_id: record.last_withdrawal_id || null,
          last_withdrawal_quantity: record.last_withdrawal_quantity || null,
          last_withdrawal_date: record.last_withdrawal_date || null
        };
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => { setWithdrawForm({ quantity: '', date: new Date().toISOString().split('T')[0], notes: '' }); setWithdrawItem(item); }}
              >
                <PackageMinus className="h-3.5 w-3.5" />
                <span>Withdraw Stock</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                disabled={!record.last_withdrawal_id}
                onClick={() => handleUndoLastWithdrawal(record)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Undo Last Withdrawal</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    },
  ];

  return (
    <>
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="inventory">Inventory Update</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory">
          <DataTable
            title=""
            columns={columns}
            records={records}
            exportFileName="inventory_update"
            pagination={pagination}
            addButton={
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white text-base"
                onClick={() => { setItemForm({ name: '', unit: '', min_stock: '' }); setAddItemOpen(true); }}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />Add Item
              </Button>
            }
          />
        </TabsContent>
      </Tabs>

      {/* Withdraw Stock Modal */}
      {withdrawItem && (
        <ModalLayout
          title="Withdraw Stock"
          subtitle={
            <div className="flex items-center gap-2">
              <Badge className="bg-red-50 text-red-700 border-red-200 font-semibold">{withdrawItem.name}</Badge>
              <span className="text-base text-slate-400">Unit: {withdrawItem.unit}</span>
            </div>
          }
          onClose={() => setWithdrawItem(null)}
          maxWidth="400px"
        >
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Quantity ({withdrawItem?.unit}) *</Label>
                <Input
                  type="number" step="0.01" min="0" placeholder="0"
                  value={withdrawForm.quantity}
                  onChange={e => setWithdrawForm({ ...withdrawForm, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={withdrawForm.date} onChange={e => setWithdrawForm({ ...withdrawForm, date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input placeholder="Optional notes" value={withdrawForm.notes} onChange={e => setWithdrawForm({ ...withdrawForm, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={() => setWithdrawItem(null)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleWithdrawStock} disabled={withdrawSaving}>
                {withdrawSaving ? 'Saving...' : 'Log Withdrawal'}
              </Button>
            </div>
          </div>
        </ModalLayout>
      )}

      {/* Add Item Modal */}
      {addItemOpen && (
        <ModalLayout
          title="Add New Item"
          onClose={() => setAddItemOpen(false)}
          maxWidth="400px"
        >
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Item Name *</Label>
              <Input
                placeholder="e.g. Cocopeat"
                value={itemForm.name}
                onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Unit *</Label>
                <Select value={itemForm.unit} onValueChange={(v: string) => setItemForm({ ...itemForm, unit: v })}>
                  <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Min Stock</Label>
                <Input
                  type="number" placeholder="0"
                  value={itemForm.min_stock}
                  onChange={e => setItemForm({ ...itemForm, min_stock: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={() => setAddItemOpen(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveItem} disabled={saving}>
                {saving ? 'Saving...' : 'Add Item'}
              </Button>
            </div>
          </div>
        </ModalLayout>
      )}
    </>
  );
}

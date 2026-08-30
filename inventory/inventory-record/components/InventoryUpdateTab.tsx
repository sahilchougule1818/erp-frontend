import { InventoryUpdateTable } from './InventoryUpdateTable';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { inventoryApi } from '../../api/inventoryApi';
import { useNotify } from '../../../shared/hooks/useNotify';

type Item = { 
  id: number; 
  name: string; 
  unit: string; 
  minStock: number;
  currentStock: number;
  lastWithdrawalId: number | null;
  lastWithdrawalQuantity: number | null;
  lastWithdrawalDate: string | null;
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
  const [itemForm, setItemForm] = useState({ name: '', unit: '', minStock: '' });
  const [saving, setSaving] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ quantity: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [withdrawSaving, setWithdrawSaving] = useState(false);

  const handleUndoLastWithdrawal = async (item: Item) => {
    if (!item.lastWithdrawalId) {
      notify.error('No withdrawal to undo');
      return;
    }
    const detail = `${Number(item.lastWithdrawalQuantity).toLocaleString()} ${item.unit}`;
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
        itemId: withdrawItem.id,
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
        minStock: itemForm.minStock ? parseFloat(itemForm.minStock) : 0,
      });
      notify.success(`Item "${itemForm.name}" added`);
      setItemForm({ name: '', unit: '', minStock: '' });
      setAddItemOpen(false);
      onItemAdded();
    } catch (err: any) {
      notify.error(err.message || 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  // Build records with computed fields for InventoryUpdateTable
  const records = items.map(item => {
    const currentStock = item.currentStock || 0;
    const isLow = currentStock <= item.minStock;
    return { ...item, currentStock, isLow };
  });

  const columns = [
    {
      key: 'name',
      label: 'Item',
      render: (val: string) => <span>{val}</span>
    },
    { key: 'unit', label: 'Unit' },
    { key: 'minStock', label: 'Min Stock' },
    { key: 'currentStock', label: 'Current Stock' },
    {
      key: 'id',
      label: '',
      render: (_: any, record: any) => {
        const item: Item = { 
          id: record.id, 
          name: record.name, 
          unit: record.unit, 
          minStock: record.minStock,
          currentStock: record.currentStock || 0,
          lastWithdrawalId: record.lastWithdrawalId || null,
          lastWithdrawalQuantity: record.lastWithdrawalQuantity || null,
          lastWithdrawalDate: record.lastWithdrawalDate || null
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
                disabled={!record.lastWithdrawalId}
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
          <InventoryUpdateTable
            title="Inventory Update"
            columns={columns}
            records={records}
            exportFileName="inventory_update"
            pagination={pagination}
            addButton={
              <Button
                size="sm"
               
                onClick={() => { setItemForm({ name: '', unit: '', minStock: '' }); setAddItemOpen(true); }}
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
                  value={itemForm.minStock}
                  onChange={e => setItemForm({ ...itemForm, minStock: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={() => setAddItemOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveItem} disabled={saving}>
                {saving ? 'Saving...' : 'Add Item'}
              </Button>
            </div>
          </div>
        </ModalLayout>
      )}
    </>
  );
}

import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/button';
import { Plus, Edit, Trash2, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Badge } from '../../../shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { DataTable } from '../../../shared/components/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { inventoryApi } from '../../services/inventoryApi';
import { parseSpringPage } from '../../../shared/utils/springPage';

type Supplier = {
  id: number;
  name: string;
  contact: string;
  location: string;
  items_supplied: string[];
};

type Item = {
  id: number;
  name: string;
};

export function SupplierDetail() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  const [supplierForm, setSupplierForm] = useState({ name: '', contact: '', location: '', items_supplied: [] as string[] });

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      const [supRes, itemRes] = await Promise.all([
        inventoryApi.suppliers.getAll(currentPage, limit),
        inventoryApi.items.getAll(1, 500)
      ]);
      const { data: supData, pagination } = parseSpringPage<Supplier>(supRes);
      const { data: itemData } = parseSpringPage<Item>(itemRes);
      setSuppliers(supData);
      setItems(itemData);
      setCurrentPage(pagination.page);
      setTotalPages(pagination.totalPages);
      setTotal(pagination.total);
    } catch (e) {
      console.error('Fetch error:', e);
      setSuppliers([]);
      setItems([]);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSaveSupplier = async () => {
    try {
      if (editingSupplier) {
        await inventoryApi.suppliers.update(editingSupplier.id, supplierForm);
      } else {
        await inventoryApi.suppliers.create(supplierForm);
      }
      fetchData();
      setIsSupplierModalOpen(false);
      setEditingSupplier(null);
      setSupplierForm({ name: '', contact: '', location: '', items_supplied: [] });
    } catch (error) {
      console.error('Failed to save supplier:', error);
    }
  };

  const supplierColumns = [
    { label: 'ID', key: 'id' },
    { label: 'Supplier Name', key: 'name' },
    { label: 'Contact', key: 'contact' },
    { label: 'Location', key: 'location' },
    { 
      label: 'Supplies', 
      key: 'items_supplied',
      render: (val: string[]) => val?.join(', ') || '—'
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (_: any, record: Supplier) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => {
            setEditingSupplier(record);
            setSupplierForm({ name: record.name, contact: record.contact, location: record.location, items_supplied: record.items_supplied || [] });
            setIsSupplierModalOpen(true);
          }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={async () => {
            if (confirm('Delete this supplier?')) {
              await inventoryApi.suppliers.delete(record.id);
              fetchData();
            }
          }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <Tabs defaultValue="supplier" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="supplier">Supplier Master</TabsTrigger>
        </TabsList>
        
        <TabsContent value="supplier">
          <DataTable 
            title="" 
            columns={supplierColumns} 
            records={suppliers}
            pagination={{
              currentPage,
              totalPages,
              total,
              limit,
              onPageChange: handlePageChange
            }}
            addButton={
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                setEditingSupplier(null);
                setSupplierForm({ name: '', contact: '', location: '', items_supplied: [] });
                setIsSupplierModalOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />Add New Supplier
              </Button>
            }
          />
        </TabsContent>
      </Tabs>

      {/* Supplier Modal */}
      <Dialog open={isSupplierModalOpen} onOpenChange={(v: boolean) => setIsSupplierModalOpen(v)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Supplier Name</Label>
              <Input value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} placeholder="e.g. Reliance Agri" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Contact</Label>
                <Input value={supplierForm.contact} onChange={e => setSupplierForm({...supplierForm, contact: e.target.value})} placeholder="Phone number" />
              </div>
              <div className="space-y-1">
                <Label>Location</Label>
                <Input value={supplierForm.location} onChange={e => setSupplierForm({...supplierForm, location: e.target.value})} placeholder="City/State" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Supplies (Select Items)</Label>
              <Select onValueChange={(v: string) => {
                if (!supplierForm.items_supplied.includes(v)) {
                  setSupplierForm({...supplierForm, items_supplied: [...supplierForm.items_supplied, v]});
                }
              }}>
                <SelectTrigger><SelectValue placeholder="Add Item" /></SelectTrigger>
                <SelectContent>
                  {items.map(i => <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {supplierForm.items_supplied.map(item => (
                  <Badge key={item} className="bg-green-50 text-green-700 border-green-200 cursor-pointer" onClick={() => {
                    setSupplierForm({...supplierForm, items_supplied: supplierForm.items_supplied.filter(i => i !== item)});
                  }}>
                    {item} ×
                  </Badge>
                ))}
              </div>
            </div>
            <Button className="w-full bg-green-600" onClick={handleSaveSupplier}>Save Supplier</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SupplierDetail;

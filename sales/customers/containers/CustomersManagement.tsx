import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DataTable } from '../../../shared/components/DataTable';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { useCustomers } from '../../hooks/useSalesApi';
import { useNotify } from '../../../shared/hooks/useNotify';
import { customersApi, Customer } from '../../services/salesApi';
import { Plus, Pencil } from 'lucide-react';

type CustomerFormValues = {
  name: string;
  phone_number: string;
  address: string;
};

export function CustomersManagement() {
  const { customers, pagination, loading, refetch } = useCustomers();
  const notify = useNotify();

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormValues>();

  const handlePageChange = (page: number) => {
    refetch(page);
  };

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', phone_number: '', address: '' });
    setIsOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    reset({
      name: customer.name,
      phone_number: customer.phone_number || '',
      address: customer.address || '',
    });
    setIsOpen(true);
  };

  const onSubmit = async (data: CustomerFormValues) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        phone_number: data.phone_number || undefined,
        address: data.address || undefined,
      };
      if (editing) {
        await customersApi.update(editing.customer_id, payload);
        notify.success('Customer updated');
      } else {
        await customersApi.create(payload);
        notify.success('Customer added');
      }
      refetch();
      setIsOpen(false);
    } catch (err: any) {
      notify.error(err.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'customer_id', label: 'Customer ID' },
    { key: 'name', label: 'Name' },
    {
      key: 'phone_number',
      label: 'Phone',
      render: (val: string) => val || '—'
    },
    {
      key: 'address',
      label: 'Address',
      render: (val: string) => val || '—'
    },
    {
      key: 'created_at',
      label: 'Added On',
      render: (val: string) =>
        val
          ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—'
    },
  ];

  return (
    <div className="p-6">
      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers">
          <DataTable
            title=""

            columns={columns}
            records={customers.filter(b => !b.is_deleted)}
            onEdit={openEdit}
            addButton={
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" /> Add Customer
              </Button>
            }
            filterConfig={{
              filter1Key: 'name',
              filter1Label: 'Search by name...',
              filter2Key: 'phone_number',
              filter2Label: 'Phone',
            }}
            exportFileName="customers"
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

      <Dialog open={isOpen} onOpenChange={(v) => { if (!v) { reset(); setEditing(null); } setIsOpen(v); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                {...register('name', { required: 'Name is required' })}
                placeholder="Full name"
                className={errors.name ? 'border-red-400' : ''}
              />
              {errors.name && <p className="text-base text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input {...register('phone_number')} placeholder="9999999999" />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input {...register('address')} placeholder="Village / City" />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Customer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

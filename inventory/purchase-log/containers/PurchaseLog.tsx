import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Badge } from '../../../shared/ui/badge';
import { DataTable } from '../../../shared/components/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { inventoryApi } from '../../services/inventoryApi';
import { format } from 'date-fns';
import { parseSpringPage } from '../../../shared/utils/springPage';

type Transaction = {
  id: number;
  item_id: number;
  item_name: string;
  type: 'purchase' | 'withdrawal';
  quantity: number;
  date: string;
  supplier_name?: string;
  price?: number;
  current_stock: number;
  notes?: string;
};

export function PurchaseLog() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      const res = await inventoryApi.stockUsage.getHistory(currentPage, limit);
      const { data, pagination } = parseSpringPage<Transaction>(res);
      setTransactions(data);
      setCurrentPage(pagination.page);
      setTotalPages(pagination.totalPages);
      setTotal(pagination.total);
    } catch {
      setTransactions([]);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      key: 'purchase_date',
      label: 'Date',
      render: (val: string) => (val ? format(new Date(val), 'dd MMM yyyy') : '—')
    },
    { key: 'item_name', label: 'Item' },
    { key: 'quantity', label: 'Qty' },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'purchase_id', label: 'Purchase ID' },
    { key: 'notes', label: 'Notes' },
  ];

  const purchases = transactions.filter(t => t.type === 'purchase');

  return (
    <div className="p-6">
      <Tabs defaultValue="purchase" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="purchase">Purchase Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchase">
          <DataTable
            title=""
            columns={columns}
            records={purchases}
            filterConfig={{
              filter1Key: 'item_name',
              filter1Label: 'Search item...',
              filter2Key: 'supplier_name',
              filter2Label: 'Supplier',
            }}
            exportFileName="purchase_log"
            pagination={{
              currentPage,
              totalPages,
              total,
              limit,
              onPageChange: handlePageChange
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

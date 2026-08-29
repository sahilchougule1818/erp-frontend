import { useState, useEffect } from 'react';
import { LayoutList } from 'lucide-react';
import { Badge } from '../../../shared/ui/badge';
import { DataTable } from '../../../shared/components/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { inventoryApi } from '../../api/inventoryApi';
import { format } from 'date-fns';
import { parseSpringPage } from '../../../shared/utils/springPage';

type Transaction = {
  purchaseId: string;
  itemId: number;
  itemName: string;
  unit: string;
  type: 'purchase' | 'withdrawal' | 'usage';
  quantity: number;
  purchaseDate?: string;
  usageDate?: string;
  currentStock: number;
  notes?: string;
};

export function WithdrawalLog() {
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
      const res = await inventoryApi.stockUsage.getHistory(currentPage, limit, 'usage');
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

  const usageRecords = transactions;

  const columns = [
    {
      key: 'usageDate',
      label: 'Date',
      render: (val: string) => (val ? format(new Date(val), 'dd MMM yyyy') : '—')
    },
    { key: 'itemName', label: 'Item' },
    { key: 'quantity', label: 'Qty Used' },
    { key: 'notes', label: 'Notes' },
  ];

  return (
    <div className="p-6">
      <Tabs defaultValue="withdrawal" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="withdrawal">Withdrawal Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="withdrawal">
          <DataTable
            title=""
            columns={columns}
            records={usageRecords}
            filterConfig={{
              filter1Key: 'itemName',
              filter1Label: 'Search item...',
            }}
            exportFileName="stock_usage_log"
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

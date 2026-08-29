import { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { inventoryApi } from '../../api/inventoryApi';
import { InventoryUpdateTab } from '../components/InventoryUpdateTab';
import { parseSpringPage } from '../../../shared/utils/springPage';

type ItemWithLastWithdrawal = {
  id: number;
  name: string;
  unit: string;
  minStock: number;
  currentStock: number;
  lastWithdrawalId: number | null;
  lastWithdrawalQuantity: number | null;
  lastWithdrawalDate: string | null;
  lastWithdrawalNotes: string | null;
};

export function InventoryRecord() {
  const [items, setItems] = useState<ItemWithLastWithdrawal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchItems();
  }, [currentPage]);

  const fetchItems = async () => {
    try {
      const res = await inventoryApi.stockUsage.getItemsWithLastWithdrawal(currentPage, limit);
      const { data, pagination } = parseSpringPage<ItemWithLastWithdrawal>(res);
      setItems(data);
      setCurrentPage(pagination.page);
      setTotalPages(pagination.totalPages);
      setTotal(pagination.total);
    } catch (e) {
      console.error(e);
      setItems([]);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <InventoryUpdateTab
        items={items}
        onStockAdded={fetchItems}
        onItemAdded={fetchItems}
        pagination={{
          currentPage,
          totalPages,
          total,
          limit,
          onPageChange: handlePageChange
        }}
      />
    </div>
  );
}

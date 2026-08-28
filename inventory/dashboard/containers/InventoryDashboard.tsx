import { useState, useEffect } from 'react';
import { Box, AlertTriangle } from 'lucide-react';
import { DataTable } from '../../../shared/components/DataTable';
import { inventoryApi } from '../../services/inventoryApi';
import { parseSpringPage } from '../../../shared/utils/springPage';

export function InventoryDashboard() {
  const [stockLevels, setStockLevels] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total_items: number; low_stock_items: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  useEffect(() => {
    inventoryApi.items.getDashboardStats()
      .then((res: any) => setStats(res))
      .catch((e: any) => console.error('Failed to fetch stats:', e));
  }, []);

  const fetchData = async () => {
    try {
      const stockRes = await inventoryApi.stockUsage.getStockLevels(currentPage, limit);
      const { data, pagination } = parseSpringPage(stockRes);
      setStockLevels(data);
      setCurrentPage(pagination.page);
      setTotalPages(pagination.totalPages);
      setTotal(pagination.total);
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const stockColumns = [
    { label: 'Item Name', key: 'item_name' },
    { label: 'Current Stock', key: 'current_stock' },
    { label: 'Min Stock', key: 'min_stock' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        <div style={{ padding: '20px', backgroundColor: '#EAF3DE', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-base font-semibold text-[#3B6D11] uppercase tracking-wider">Total Items</span>
            <Box style={{ color: '#3B6D11', width: '20px', height: '20px' }} />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#27500A', marginTop: '8px' }}>
            {stats ? Number(stats.total_items) : 0}
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#FCEBEB', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-base font-semibold text-[#A32D2D] uppercase tracking-wider">Low Stock Items</span>
            <AlertTriangle style={{ color: '#A32D2D', width: '20px', height: '20px' }} />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#791F1F', marginTop: '8px' }}>
            {stats ? Number(stats.low_stock_items) : 0}
          </div>
        </div>
      </div>

      <DataTable
        title="Live Stock Inventory"
        columns={stockColumns}
        records={stockLevels}
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

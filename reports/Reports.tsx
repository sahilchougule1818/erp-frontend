import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import { Button } from '../shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/ui/tabs';
import { Input } from '../shared/ui/input';
import { Download, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { reportsApi } from './services/reportsApi';
import { useState, useEffect } from 'react';

export function Reports() {
  const [activeTab, setActiveTab] = useState('indoor');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const [indoorData, setIndoorData] = useState<any[]>([]);
  const [outdoorData, setOutdoorData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  const getActiveData = () => {
    if (activeTab === 'indoor') return indoorData;
    if (activeTab === 'outdoor') return outdoorData;
    if (activeTab === 'sales') return salesData;
    return [];
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.fetchReport(activeTab, { startDate, endDate });
      if (activeTab === 'indoor') setIndoorData(data);
      else if (activeTab === 'outdoor') setOutdoorData(data);
      else if (activeTab === 'sales') setSalesData(data);
    } catch (err: any) {
      console.error('Failed to fetch report:', err);
      setError(err?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleExport = () => {
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `Report_${activeTab}_${today}.xlsx`;

    const getSourceData = () => {
      if (activeTab === 'indoor') return indoorData;
      if (activeTab === 'outdoor') return outdoorData;
      if (activeTab === 'sales') return salesData;
      return [];
    };

    const sourceData = getSourceData();
    if (sourceData.length === 0) return;

    const formatted = sourceData.map((item: any) => {
      const row: any = { 'Report Date': today };
      Object.keys(item).forEach(key => {
        row[key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')] = item[key];
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report Data");
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>Reports</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[150px]"
                />
                <span className="text-base font-medium">to</span>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[150px]"
                />
                <Button variant="outline" onClick={loadData} disabled={loading} className="flex gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>
              <Button variant="outline" className="flex gap-2" onClick={handleExport} disabled={loading}>
                <Download className="w-4 h-4" />
                {loading ? 'Loading...' : 'Export'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="indoor">Indoor Sales</TabsTrigger>
              <TabsTrigger value="outdoor">Outdoor Sales</TabsTrigger>
              <TabsTrigger value="sales">Finance</TabsTrigger>
            </TabsList>

            <TabsContent value="indoor">
              {getActiveData().length === 0 && !loading ? (
                <div className="flex h-[400px] items-center justify-center text-gray-500">No indoor report data for the selected period.</div>
              ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={indoorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_bookings" fill="#3b82f6" name="Total Bookings" />
                  <Bar dataKey="delivered_bookings" fill="#22c55e" name="Delivered" />
                  <Bar dataKey="pending_bookings" fill="#eab308" name="Pending" />
                  <Bar dataKey="cancelled_bookings" fill="#ef4444" name="Cancelled" />
                </BarChart>
              </ResponsiveContainer>
              )}
            </TabsContent>

            <TabsContent value="outdoor">
              {getActiveData().length === 0 && !loading ? (
                <div className="flex h-[400px] items-center justify-center text-gray-500">No outdoor report data for the selected period.</div>
              ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={outdoorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_bookings" fill="#6366f1" name="Total Bookings" />
                  <Bar dataKey="delivered_bookings" fill="#4ade80" name="Delivered" />
                  <Bar dataKey="pending_bookings" fill="#f59e0b" name="Pending" />
                  <Bar dataKey="cancelled_bookings" fill="#ef4444" name="Cancelled" />
                </BarChart>
              </ResponsiveContainer>
              )}
            </TabsContent>

            <TabsContent value="sales">
              {getActiveData().length === 0 && !loading ? (
                <div className="flex h-[400px] items-center justify-center text-gray-500">No finance report data for the selected period.</div>
              ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_credits" fill="#22c55e" name="Total Credits (₹)" />
                  <Bar dataKey="total_debits" fill="#ef4444" name="Total Debits (₹)" />
                  <Bar dataKey="total_refunds" fill="#f97316" name="Total Refunds (₹)" />
                </BarChart>
              </ResponsiveContainer>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

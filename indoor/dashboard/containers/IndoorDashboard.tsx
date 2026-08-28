import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Package, FlaskConical, Boxes } from 'lucide-react';
import { DataTable } from '../../../shared/components/DataTable';
import { useIndoorDashboard } from '../hooks/useIndoorDashboard';

export function IndoorDashboard() {
  const [totalMediaBatches, setTotalMediaBatches] = useState(0);
  const [totalBottles, setTotalBottles] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [mediaBatches, setMediaBatches] = useState([]);
  const [activeBatches, setActiveBatches] = useState([]);
  const { stats, loading } = useIndoorDashboard();

  useEffect(() => {
    if (stats) {
      setTotalMediaBatches(parseInt(stats.totalMediaBatches) || 0);
      setTotalBatches(parseInt(stats.totalBatches) || 0);
      setTotalBottles(parseInt(stats.totalBottles) || 0);
      setMediaBatches(stats.mediaBatches || []);
      setActiveBatches(stats.activeBatches || []);
    }
  }, [stats]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Indoor Dashboard</h1>
        <p className="text-base text-gray-500 mt-1">Real-time production metrics and operator performance</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="p-5 bg-green-50 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-green-800 uppercase tracking-wider">Total Media Batches</span>
            <FlaskConical className="text-green-600 w-5 h-5" />
          </div>
          <div className="text-3xl font-bold text-green-900 mt-2">{totalMediaBatches}</div>
        </div>

        <div className="p-5 bg-teal-50 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-teal-800 uppercase tracking-wider">Total Batches</span>
            <Package className="text-teal-600 w-5 h-5" />
          </div>
          <div className="text-3xl font-bold text-teal-900 mt-2">{totalBatches}</div>
        </div>

        <div className="p-5 bg-blue-50 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-blue-800 uppercase tracking-wider">Total Bottles Processed</span>
            <Boxes className="text-blue-600 w-5 h-5" />
          </div>
          <div className="text-3xl font-bold text-blue-900 mt-2">{totalBottles.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Media Batches Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Media Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Media Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Media Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Completed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mediaBatches.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-base text-gray-500">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      mediaBatches.map((media: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-base whitespace-nowrap">{media.media_code}</td>
                          <td className="px-4 py-3 text-base whitespace-nowrap">{media.media_type || '—'}</td>
                          <td className="px-4 py-3 text-base whitespace-nowrap">{media.media_total || '—'}</td>
                          <td className="px-4 py-3 text-base whitespace-nowrap">{media.completed_date ? new Date(media.completed_date).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Active Plant Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Batch Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Plant Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Stage</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Phase</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Lab</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Available Plants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBatches.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-base text-gray-500">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      activeBatches.map((batch: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-base whitespace-nowrap">{batch.batch_code}</td>
                          <td className="px-4 py-3 text-base whitespace-nowrap">{batch.plant_name || '—'}</td>
                          <td className="px-4 py-3 text-base whitespace-nowrap">{batch.stage || '—'}</td>
                          <td className="px-4 py-3 text-base whitespace-nowrap">{batch.phase || '—'}</td>
                          <td className="px-4 py-3 text-base whitespace-nowrap">{batch.lab_number || '—'}</td>
                          <td className="px-4 py-3 text-base whitespace-nowrap">{(batch.available_bottles || 0).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

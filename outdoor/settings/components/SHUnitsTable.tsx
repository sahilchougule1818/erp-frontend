import { useMemo, useState, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { PenSquare, Download, Users, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../shared/ui/dialog';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { useToast } from '../../../shared/ui/use-toast';
import * as XLSX from 'xlsx';
import { getRecordField } from '../../../shared/utils/springPage';

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  COMPLETED: 'bg-gray-50 text-gray-700 border-gray-200',
  OUTDOOR_READY: 'bg-orange-50 text-orange-700 border-orange-200',
  AT_OUTDOOR: 'bg-purple-50 text-purple-700 border-purple-200',
  SOLD_OUT: 'bg-rose-50 text-rose-700 border-red-200',
  SOLD: 'bg-rose-50 text-rose-700 border-red-200',
  Yes: 'bg-green-50 text-green-700 border-green-200',
  No: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  stock_unavailable: 'bg-red-50 text-red-700 border-red-200',
};

const PHASE_BADGE: Record<string, string> = {
  primary_hardening: 'bg-green-50 text-green-700 border-green-200',
  secondary_hardening: 'bg-blue-50 text-blue-700 border-blue-200',
  holding_area: 'bg-orange-50 text-orange-700 border-orange-200',
};

const PHASE_LABEL: Record<string, string> = {
  primary_hardening: 'Primary Hardening',
  secondary_hardening: 'Secondary Hardening',
  holding_area: 'Holding Area',
};

function renderStatusBadge(value: any) {
  const label = value ?? '-';
  const cls = STATUS_BADGE[label] ?? 'bg-gray-50 text-gray-700 border-gray-200';
  return <span className={`px-2 py-1 rounded border text-base ${cls}`}>{label}</span>;
}

interface Column {
  key: string;
  label: string;
  render?: (value: any, record: any) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  highlight?: string;
}

export interface SHUnitsTableProps {
  title: string;
  description?: string;
  columns: Column[];
  records: any[];
  onEdit?: (record: any) => void;
  onEditWorkers?: (record: any) => void;
  onDelete?: (record: any) => void;
  addButton?: React.ReactNode;
  filterConfig?: {
    filter1Key: string;
    filter1Label: string;
    filter2Key: string;
    filter2Label: string;
  } | null;
  exportFileName?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
  };
  hideBorder?: boolean;
}

function TableFilterBar({
  records,
  filter1Key,
  filter1Label,
  filter2Key,
  filter2Label,
  selectedFilter1,
  selectedFilter2,
  onFilter1Change,
  onFilter2Change,
  onSearch,
  onReset,
  isFiltered,
}: {
  records: any[];
  filter1Key: string;
  filter1Label: string;
  filter2Key: string;
  filter2Label: string;
  selectedFilter1: string;
  selectedFilter2: string;
  onFilter1Change: (value: string) => void;
  onFilter2Change: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  isFiltered: boolean;
}) {
  const filter1Options = Array.from(
    new Set(
      (records || []).map((r) => {
        const val = getRecordField(r, filter1Key);
        return filter1Key.includes('date') && val ? String(val).split('T')[0] : val;
      }).filter(Boolean)
    )
  );

  const filter2Options = Array.from(
    new Set(
      ((selectedFilter1
        ? (records || []).filter((r) => {
            const val = getRecordField(r, filter1Key);
            const compareVal = filter1Key.includes('date') && val ? String(val).split('T')[0] : val;
            return compareVal === selectedFilter1;
          })
        : records || []) as any[]).map((r) => getRecordField(r, filter2Key)).filter(Boolean)
    )
  );

  return (
    <div className="flex items-center gap-3 mb-4">
      <Select value={selectedFilter1} onValueChange={onFilter1Change}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={`Select ${filter1Label}`} />
        </SelectTrigger>
        <SelectContent>
          {filter1Options.map((opt) => (
            <SelectItem key={String(opt)} value={String(opt)}>{String(opt)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedFilter2} onValueChange={onFilter2Change} disabled={!selectedFilter1}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={`Select ${filter2Label}`} />
        </SelectTrigger>
        <SelectContent>
          {filter2Options.map((opt) => (
            <SelectItem key={String(opt)} value={String(opt)}>{String(opt)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={onSearch} disabled={!selectedFilter1 && !selectedFilter2} size="sm">
        <Search className="w-4 h-4 mr-2" />Search
      </Button>

      {isFiltered && (
        <Button onClick={onReset} variant="outline" size="sm">
          <X className="w-4 h-4 mr-2" />Back to Main Data
        </Button>
      )}
    </div>
  );
}

function EditSearchButton({
  records,
  filter1Key,
  filter1Label,
  filter2Key,
  filter2Label,
  onEdit,
}: {
  records: any[];
  filter1Key: string;
  filter1Label: string;
  filter2Key: string;
  filter2Label: string;
  onEdit: (record: any) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchFilter1, setSearchFilter1] = useState('');
  const [searchFilter2, setSearchFilter2] = useState('');

  const filter2Options = useMemo(() => {
    if (!searchFilter1) return [];
    const filtered = records.filter((r) => {
      const val = r[filter1Key];
      const compareVal = (filter1Key.includes('date') && val ? val.split('T')[0] : String(val)).trim().toLowerCase();
      const searchVal = searchFilter1.trim().toLowerCase();
      return compareVal === searchVal;
    });
    return Array.from(new Set(filtered.map((r) => r[filter2Key]).filter(Boolean)));
  }, [records, searchFilter1, filter1Key, filter2Key]);

  const handleSearch = () => {
    if (!searchFilter1 || !searchFilter2) {
      toast({ title: 'Please select both fields', variant: 'destructive' });
      return;
    }
    const record = records.find((r) => {
      const val = r[filter1Key];
      const compareVal = (filter1Key.includes('date') && val ? val.split('T')[0] : String(val)).trim().toLowerCase();
      const searchVal = searchFilter1.trim().toLowerCase();
      return compareVal === searchVal && String(r[filter2Key]) === String(searchFilter2);
    });
    if (record) {
      onEdit(record);
      setOpen(false);
      setSearchFilter1('');
      setSearchFilter2('');
    } else {
      toast({ title: 'No record found', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PenSquare className="w-4 h-4 mr-2" />Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Search Record to Edit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{filter1Label}</Label>
            <Input
              type={filter1Key.includes('date') ? 'date' : 'text'}
              value={searchFilter1}
              onChange={(e) => { setSearchFilter1(e.target.value); setSearchFilter2(''); }}
            />
          </div>
          <div className="space-y-2">
            <Label>{filter2Label}</Label>
            <Select value={searchFilter2} onValueChange={setSearchFilter2} disabled={!searchFilter1}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${filter2Label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {filter2Options.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => { setOpen(false); setSearchFilter1(''); setSearchFilter2(''); }}>
            Cancel
          </Button>
          <Button onClick={handleSearch}>
            Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const SHUnitsTable = memo(function SHUnitsTable({
  title,
  description,
  columns,
  records = [],
  onEdit,
  onEditWorkers,
  onDelete,
  addButton,
  filterConfig,
  exportFileName = 'data',
  pagination,
  hideBorder = false,
}: SHUnitsTableProps) {
  const [selectedFilter1, setSelectedFilter1] = useState('');
  const [selectedFilter2, setSelectedFilter2] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);

  const displayRecords = useMemo(() => {
    const data = Array.isArray(records) ? records : (records as any)?.data || [];
    if (!data || data.length === 0) return [];
    if (!filterConfig || !isFiltered) return data;
    return data.filter((r) => {
      const { filter1Key, filter2Key } = filterConfig;
      const val1 = getRecordField(r, filter1Key);
      const val2 = getRecordField(r, filter2Key);
      const match1 = !selectedFilter1 || (filter1Key.includes('date') && val1 ? String(val1).split('T')[0] === selectedFilter1 : val1 === selectedFilter1);
      const match2 = !selectedFilter2 || val2 === selectedFilter2;
      return match1 && match2;
    });
  }, [records, isFiltered, selectedFilter1, selectedFilter2, filterConfig]);

  const recordsArray = useMemo(() => {
    return Array.isArray(records) ? records : (records as any)?.data || [];
  }, [records]);

  const handleExport = useCallback(() => {
    const exportData = displayRecords.map((record) => {
      const row: any = {};
      columns.forEach((col) => {
        row[col.label] = getRecordField(record, col.key);
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  }, [displayRecords, columns, exportFileName]);

  const handleReset = useCallback(() => {
    setSelectedFilter1('');
    setSelectedFilter2('');
    setIsFiltered(false);
  }, []);

  return (
    <Card className={'erp-table-card shadow-sm'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-base text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="flex gap-2">
          {addButton}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
          {(onEdit || onEditWorkers) && filterConfig && (
            <EditSearchButton
              records={records}
              filter1Key={filterConfig.filter1Key}
              filter1Label={filterConfig.filter1Label}
              filter2Key={filterConfig.filter2Key}
              filter2Label={filterConfig.filter2Label}
              onEdit={onEdit || (() => {})}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filterConfig && recordsArray && (
          <TableFilterBar
            records={recordsArray}
            filter1Key={filterConfig.filter1Key}
            filter1Label={filterConfig.filter1Label}
            filter2Key={filterConfig.filter2Key}
            filter2Label={filterConfig.filter2Label}
            selectedFilter1={selectedFilter1}
            selectedFilter2={selectedFilter2}
            onFilter1Change={setSelectedFilter1}
            onFilter2Change={setSelectedFilter2}
            onSearch={() => setIsFiltered(true)}
            onReset={handleReset}
            isFiltered={isFiltered}
          />
        )}
        <div className="erp-table-scroll">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr className="divide-x divide-gray-100">
                {columns.map((col) => (
                  <th key={col.key} className={`px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap ${col.key === '_actions' ? 'sticky right-0 bg-green-50 z-10 w-24 [box-shadow:-1px_0_0_0_#e2e8f0]' : col.highlight === 'green' ? 'bg-green-100' : col.label?.startsWith('Current') ? 'bg-yellow-100' : col.label?.startsWith('Total') ? 'bg-blue-100' : ''}`}>
                    {col.label}
                  </th>
                ))}
                {(onEdit || onEditWorkers || onDelete) && (
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-green-50 z-10 w-24 [box-shadow:-1px_0_0_0_#e2e8f0]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayRecords.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-base font-normal text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                displayRecords.map((record, index) => {
                  const isHistorical = getRecordField(record, 'isActive') === false || getRecordField(record, 'active') === false;
                  const rowKey = getRecordField(record, 'id')
                    ?? getRecordField(record, 'orderId')
                    ?? getRecordField(record, 'batchId')
                    ?? getRecordField(record, 'batchCode')
                    ?? index;
                  return (
                    <tr key={String(rowKey)} className="border-b hover:bg-gray-50 divide-x divide-gray-100">
                      {columns.map((col) => {
                        const cellValue = getRecordField(record, col.key);
                        return (
                          <td key={col.key} className={`px-4 py-4 text-base font-normal whitespace-nowrap align-middle text-center ${col.key === '_actions' ? 'sticky right-0 bg-green-50 z-10 [box-shadow:-1px_0_0_0_#e2e8f0]' : col.highlight === 'green' ? 'bg-green-50' : col.label?.startsWith('Current') ? 'bg-yellow-50' : col.label?.startsWith('Total') ? 'bg-blue-50' : ''}`}>
                            {col.render
                              ? col.render(cellValue, record)
                              : (col.key === 'qtyAvailable' || col.key === 'availablePlants')
                                ? <span>{cellValue != null ? Number(cellValue).toLocaleString() : '—'}</span>
                                : (col.key === 'mortalityCount' || col.key === 'totalMortality' || col.key === 'qtyContaminated' || col.key === 'totalQtyContaminated')
                                  ? <span className={Number(cellValue) > 0 ? 'text-red-600' : ''}>{Number(cellValue ?? 0).toLocaleString()}</span>
                                  : (col.key === 'currentPhase')
                                    ? (() => { const phase = String(cellValue ?? ''); const cls = PHASE_BADGE[phase] ?? 'bg-gray-50 text-gray-700 border-gray-200'; return <span className={`px-2 py-1 rounded border text-base ${cls}`}>{PHASE_LABEL[phase] ?? phase}</span>; })()
                                    : (col.key === 'state' || col.key === 'result' || col.key === 'status')
                                      ? renderStatusBadge(cellValue)
                                      : cellValue}
                          </td>
                        );
                      })}
                      {(onEdit || onEditWorkers || onDelete) && (
                        <td className="px-4 py-3 text-base font-normal sticky right-0 bg-green-50 z-10 [box-shadow:-1px_0_0_0_#e2e8f0]">
                          <div className="flex gap-1">
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(record)}
                                title={isHistorical ? 'Historical record — editing disabled' : 'Edit'}
                                disabled={isHistorical}
                                className={isHistorical ? 'cursor-not-allowed' : ''}
                              >
                                <PenSquare className="w-4 h-4" />
                              </Button>
                            )}
                            {onEditWorkers && record.state === 'ACTIVE' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditWorkers(record)}
                                title="Edit Workers"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Users className="w-4 h-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(record)}
                                title="Delete Record"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-3 erp-table-pagination bg-white">
            <div className="flex items-center gap-2 text-base text-gray-600">
              <span>
                Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.currentPage * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => pagination.onPageChange(1)} disabled={pagination.currentPage === 1} className="h-8 w-8 p-0">
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => pagination.onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {(() => {
                const pages: (number | string)[] = [];
                const maxVisible = 5;
                if (pagination.totalPages <= maxVisible) {
                  for (let i = 1; i <= pagination.totalPages; i++) pages.push(i);
                } else if (pagination.currentPage <= 3) {
                  for (let i = 1; i <= 4; i++) pages.push(i);
                  pages.push('...');
                  pages.push(pagination.totalPages);
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pages.push(1);
                  pages.push('...');
                  for (let i = pagination.totalPages - 3; i <= pagination.totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  pages.push('...');
                  pages.push(pagination.currentPage - 1);
                  pages.push(pagination.currentPage);
                  pages.push(pagination.currentPage + 1);
                  pages.push('...');
                  pages.push(pagination.totalPages);
                }
                return pages.map((page, idx) =>
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <Button key={page} variant={pagination.currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => pagination.onPageChange(page as number)} className="h-8 w-8 p-0">
                      {page}
                    </Button>
                  )
                );
              })()}
              <Button variant="outline" size="sm" onClick={() => pagination.onPageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => pagination.onPageChange(pagination.totalPages)} disabled={pagination.currentPage === pagination.totalPages} className="h-8 w-8 p-0">
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

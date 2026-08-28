import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Search, X } from 'lucide-react';
import { getRecordField } from '../utils/springPage';

interface TableFilterProps {
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
}

export function TableFilter({
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
  isFiltered
}: TableFilterProps) {
  const filter1Options = Array.from(
    new Set(
      (records || []).map(r => {
        const val = getRecordField(r, filter1Key);
        return filter1Key.includes('date') && val ? String(val).split('T')[0] : val;
      }).filter(Boolean)
    )
  );

  const filter2Options = Array.from(
    new Set(
      ((selectedFilter1
        ? (records || []).filter(r => {
            const val = getRecordField(r, filter1Key);
            const compareVal = filter1Key.includes('date') && val ? String(val).split('T')[0] : val;
            return compareVal === selectedFilter1;
          })
        : (records || [])
      ) as any[]).map(r => getRecordField(r, filter2Key)).filter(Boolean)
    )
  );

  return (
    <div className="flex items-center gap-3 mb-4">
      <Select value={selectedFilter1} onValueChange={onFilter1Change}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={`Select ${filter1Label}`} />
        </SelectTrigger>
        <SelectContent>
          {filter1Options.map(opt => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedFilter2} onValueChange={onFilter2Change} disabled={!selectedFilter1}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={`Select ${filter2Label}`} />
        </SelectTrigger>
        <SelectContent>
          {filter2Options.map(opt => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
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

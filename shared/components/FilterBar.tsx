import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  field1?: FilterField;
  field2?: FilterField;
  field3?: FilterField;
  onSearch?: () => void;
  batchValue?: string;
  cropValue?: string;
  onBatchChange?: (value: string) => void;
  onCropChange?: (value: string) => void;
  batches?: FilterOption[];
  crops?: FilterOption[];
}

export function FilterBar({ 
  field1,
  field2,
  field3,
  onSearch,
  batchValue, 
  cropValue, 
  onBatchChange, 
  onCropChange,
  batches = [],
  crops = []
}: FilterBarProps) {
  const firstField = field1 || {
    label: 'Batch Name',
    value: batchValue,
    onChange: onBatchChange,
    options: batches,
    placeholder: 'Select batch'
  };

  const secondField = field2 || {
    label: 'Crop Name',
    value: cropValue,
    onChange: onCropChange,
    options: crops,
    placeholder: 'Select crop'
  };

  return (
    <Card className="p-4">
      <div className="flex flex-wrap gap-3 items-end">
        {firstField && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-base mb-1.5 font-medium text-gray-700">{firstField.label}</label>
            {firstField.label.toLowerCase().includes('date') ? (
              <Input 
                type="date" 
                value={firstField.value || ''} 
                onChange={(e) => firstField.onChange?.(e.target.value)}
                className="h-10"
              />
            ) : (
              <Select value={firstField.value} onValueChange={firstField.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={firstField.placeholder || `Select ${firstField.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {firstField.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {secondField && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-base mb-1.5 font-medium text-gray-700">{secondField.label}</label>
            <Select value={secondField.value} onValueChange={secondField.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={secondField.placeholder || `Select ${secondField.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {secondField.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {field3 && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-base mb-1.5 font-medium text-gray-700">{field3.label}</label>
            <Select value={field3.value} onValueChange={field3.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={field3.placeholder || `Select ${field3.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field3.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex-shrink-0">
          <Button 
            variant={null as any}
            style={{ backgroundColor: '#4CAF50', color: 'white' }}
            className="hover:bg-[#66BB6A] font-medium shadow-sm h-10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base transition-all px-4"
            onClick={onSearch}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </Card>
  );
}

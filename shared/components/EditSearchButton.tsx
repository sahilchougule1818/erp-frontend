import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PenSquare } from 'lucide-react';
import { useToast } from '../ui/use-toast';

interface EditSearchButtonProps {
  records: any[];
  filter1Key: string;
  filter1Label: string;
  filter2Key: string;
  filter2Label: string;
  onEdit: (record: any) => void;
}

export function EditSearchButton({
  records,
  filter1Key,
  filter1Label,
  filter2Key,
  filter2Label,
  onEdit
}: EditSearchButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchFilter1, setSearchFilter1] = useState('');
  const [searchFilter2, setSearchFilter2] = useState('');

  const filter2Options = useMemo(() => {
    if (!searchFilter1) return [];
    const filtered = records.filter(r => {
      const val = r[filter1Key];
      const compareVal = (filter1Key.includes('date') && val ? val.split('T')[0] : String(val)).trim().toLowerCase();
      const searchVal = searchFilter1.trim().toLowerCase();
      return compareVal === searchVal;
    });
    return Array.from(new Set(filtered.map(r => r[filter2Key]).filter(Boolean)));
  }, [records, searchFilter1, filter1Key, filter2Key]);

  const handleSearch = () => {
    if (!searchFilter1 || !searchFilter2) {
      toast({ title: 'Please select both fields', variant: 'destructive' });
      return;
    }
    const record = records.find(r => {
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
                {filter2Options.map(opt => (
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
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

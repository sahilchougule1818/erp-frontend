import React from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { RotateCcw } from 'lucide-react';

interface AccountOption {
  id: number;
  accountName: string;
}

interface LedgerFilterBarProps {
  filters: {
    bankAccountId: string;
    type: string;
    fromDate: string;
    toDate: string;
  };
  accounts: AccountOption[];
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

export const LedgerFilterBar: React.FC<LedgerFilterBarProps> = ({ filters, accounts = [], onChange, onReset }) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={filters.bankAccountId} onValueChange={(v) => onChange('bankAccountId', v)}>
        <SelectTrigger className="h-9 w-44 text-base font-semibold">
          <SelectValue placeholder="All Accounts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-base font-semibold">All Accounts</SelectItem>
          {accounts.map(a => (
            <SelectItem key={a.id} value={String(a.id)} className="text-base">{a.accountName}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.type} onValueChange={(v) => onChange('type', v)}>
        <SelectTrigger className="h-9 w-36 text-base font-semibold">
          <SelectValue placeholder="Flow Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-base font-semibold">All Flows</SelectItem>
          <SelectItem value="credit" className="text-base font-semibold text-emerald-600">Credits Only</SelectItem>
          <SelectItem value="debit" className="text-base font-semibold text-rose-600">Debits Only</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="h-9 w-36 text-base font-semibold"
        value={filters.fromDate}
        onChange={(e) => onChange('fromDate', e.target.value)}
      />
      <Input
        type="date"
        className="h-9 w-36 text-base font-semibold"
        value={filters.toDate}
        onChange={(e) => onChange('toDate', e.target.value)}
      />

      <Button variant="outline" size="sm" className="h-9 px-3 text-base" onClick={onReset}>
        <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
      </Button>
    </div>
  );
};

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/select';
import { bankAccountsApi, BankAccount } from '../../services/salesApi';

type BankAccountSelectorProps = {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export const BankAccountSelector: React.FC<BankAccountSelectorProps> = ({
  value,
  onValueChange,
  placeholder = 'Select bank account',
  disabled = false,
}) => {
  const [accounts, setAccounts] = React.useState<BankAccount[]>([]);

  React.useEffect(() => {
    const loadAccounts = async () => {
      try {
        const allAccounts = await bankAccountsApi.getAll();
        setAccounts(allAccounts.filter(acc => acc.is_active));
      } catch (error) {
        console.error('Error loading bank accounts:', error);
        setAccounts([]);
      }
    };
    
    loadAccounts();
  }, []);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={String(account.id)}>
            {account.account_name} - {account.bank_name} (****{account.account_number.slice(-4)})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

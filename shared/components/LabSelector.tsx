import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import apiClient from '../api/apiClient';

interface Lab {
  labNumber: number;
  labName: string;
  active: boolean;
}

interface LabSelectorProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const LabSelector: React.FC<LabSelectorProps> = ({ value, onChange, className = '' }) => {
  const [labs, setLabs] = useState<Lab[]>([]);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await apiClient.get('/indoor/settings/labs');
        const rows = Array.isArray(response) ? response : [];
        setLabs(rows.filter((lab: Lab) => lab.active));
      } catch (error) {
        console.error('Failed to fetch labs:', error);
        setLabs([]);
      }
    };
    fetchLabs();
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm font-medium">Lab:</label>
      <Select
        value={value.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select lab" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">All Labs (Consolidated)</SelectItem>
          {labs.map((lab) => (
            <SelectItem key={lab.labNumber} value={lab.labNumber.toString()}>
              Lab {lab.labNumber}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

interface LabBadgeProps {
  labNumber: number;
  className?: string;
}

export const LabBadge: React.FC<LabBadgeProps> = ({ labNumber, className = '' }) => {
  const colors = {
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-green-100 text-green-800',
    3: 'bg-purple-100 text-purple-800',
  };

  return (
    <Badge 
      variant="outline" 
      className={`${colors[labNumber as keyof typeof colors] || 'bg-gray-100 text-gray-800'} ${className}`}
    >
      Lab {labNumber}
    </Badge>
  );
};

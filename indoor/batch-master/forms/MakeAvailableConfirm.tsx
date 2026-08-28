import React, { useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { AlertTriangle } from 'lucide-react';

interface MakeAvailableConfirmProps {
  batchCode: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const MakeAvailableConfirm: React.FC<MakeAvailableConfirmProps> = ({
  batchCode,
  onConfirm,
  onCancel
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await onConfirm();
    } catch (err: any) {
      setError(err.message || 'Failed to make batch available');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4" style={{ width: '450px' }}>
      <p className="text-base text-gray-700 mb-4">
        Make batch <span className="font-semibold">{batchCode}</span> available for outdoor module?
      </p>
      <p className="text-base text-gray-500 mb-6">
        This will lock subculture and incubation operations for this batch.
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-base text-red-700 break-words">{error}</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Confirm'}
        </Button>
      </div>
    </div>
  );
};

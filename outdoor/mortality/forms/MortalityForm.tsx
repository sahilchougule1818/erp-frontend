import { useState, useEffect } from 'react';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { Button } from '../../../shared/ui/button';
import { CardContent } from '../../../shared/ui/card';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { outdoorApi } from '../../services/outdoorApi';
import { useNotify } from '../../../shared/hooks/useNotify';

interface MortalityFormProps {
  batch: { batch_code: string; current_phase: string; current_tunnel: string; available_plants: number };
  onClose: () => void;
  onSuccess: () => void;
}

export function MortalityForm({ batch, onClose, onSuccess }: MortalityFormProps) {
  const [count, setCount]                         = useState<number>(0);
  const [reason, setReason]                       = useState('');
  const [currentMortality, setCurrentMortality]   = useState<number>(0);
  const [saving, setSaving]                       = useState(false);
  const [loading, setLoading]                     = useState(true);
  const notify = useNotify();

  // available_plants from batch is already reduced by current mortality.
  // So max we can SET = available_plants + currentMortality (adding back what's already counted).
  const maxAllowed = batch.available_plants + currentMortality;

  // Pre-fill current tunnel stay mortality
  useEffect(() => {
    outdoorApi.mortality.getCurrentStay(batch.batch_code)
      .then((res: any) => {
        const data = res.data ?? res;
        const fetched = Number(data.mortality_count ?? 0);
        setCurrentMortality(fetched);
        setCount(fetched);
        setReason(data.mortality_reason ?? '');
      })
      .catch(() => { /* no stay or error — defaults stay at 0 */ })
      .finally(() => setLoading(false));
  }, [batch.batch_code]);

  const handleSubmit = async () => {
    if (count < 0) { notify.error('Mortality count must be 0 or greater'); return; }
    if (count > maxAllowed) { notify.error(`Cannot exceed ${maxAllowed} plants`); return; }
    setSaving(true);
    try {
      await outdoorApi.mortality.recordMortality(batch.batch_code, count, reason || undefined, currentMortality);
      notify.success('Mortality updated');
      onSuccess();
      onClose();
    } catch (err: any) {
      notify.error(err.response?.data?.message || 'Failed to update mortality');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalLayout title="Record Mortality">
      <CardContent className="space-y-4 py-4">
        <div className="bg-gray-50 p-3 rounded-md space-y-1 text-base text-gray-600">
          <p>Batch: <span className="font-semibold text-gray-900">{batch.batch_code}</span></p>
          <p>Tunnel: <span className="font-semibold text-gray-900">{batch.current_tunnel}</span></p>
          <p>Available: <span className="font-semibold text-green-700">{batch.available_plants}</span></p>
          {!loading && currentMortality > 0 && (
            <p>Current Mortality: <span className="font-semibold text-red-600">{currentMortality}</span></p>
          )}
          {loading && <p className="text-base text-indigo-500 animate-pulse italic">Fetching current mortality...</p>}
        </div>

        <div className="space-y-2">
          <Label>Mortality Count *</Label>
          <Input
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            min={0}
            max={maxAllowed}
            disabled={loading}
            placeholder="Enter total mortality for this tunnel stay"
          />
          <p className="text-base text-gray-400">Sets total mortality for this tunnel stay (max {maxAllowed})</p>
        </div>

        <div className="space-y-2">
          <Label>Reason (optional)</Label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            placeholder="e.g. fungal infection"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving || loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || loading} className="bg-red-600 hover:bg-red-700 text-white">
            {saving ? 'Saving...' : 'Update Mortality'}
          </Button>
        </div>
      </CardContent>
    </ModalLayout>
  );
}

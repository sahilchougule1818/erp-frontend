import { useEffect, useState } from 'react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Badge } from '../../../shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Save } from 'lucide-react';
import type { MediaStorageRecord } from '../../types';

interface MediaStorageEditFormProps {
  open: boolean;
  record: MediaStorageRecord | null;
  saving: boolean;
  onSave: (data: { status: string; notes?: string }) => Promise<void>;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  IMPORTED: 'bg-yellow-100 text-yellow-800',
  READY: 'bg-green-100 text-green-800',
  DEPLETED: 'bg-gray-100 text-gray-800',
};

export function MediaStorageEditForm({
  open,
  record,
  saving,
  onSave,
  onClose,
}: MediaStorageEditFormProps) {
  const [status, setStatus] = useState('IMPORTED');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open || !record) return;
    setStatus(record.status || 'IMPORTED');
    setNotes(record.notes || '');
  }, [open, record]);

  if (!open || !record) return null;

  const handleSave = async () => {
    await onSave({ status, notes: notes.trim() || undefined });
  };

  return (
    <ModalLayout
      isOpen={open}
      onClose={() => !saving && onClose()}
      title="Edit Storage Record"
      subtitle={`Media Code: ${record.mediaCode}`}
      maxWidth="520px"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-500 uppercase">Storage Record</p>
          <Badge className={STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Media Code</Label>
            <Input value={record.mediaCode} disabled className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Media Type</Label>
            <Input value={record.mediaType || '—'} disabled className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Bottles</Label>
            <Input value={record.bottlesCount ?? ''} disabled className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Volume (ml)</Label>
            <Input value={record.volumeMl ?? '—'} disabled className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Imported</Label>
            <Input value={record.importedAt?.split('T')[0] ?? '—'} disabled className="bg-gray-100" />
          </div>
          <div className="space-y-2">
            <Label>Ready</Label>
            <Input value={record.readyAt?.split('T')[0] ?? '—'} disabled className="bg-gray-100" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={saving || record.status === 'DEPLETED'}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IMPORTED">Imported</SelectItem>
                <SelectItem value="READY">Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
            {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Save</>}
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
}

import { useState } from 'react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { ArrowUpRight } from 'lucide-react';
import type { MediaStorageRecord } from '../../types';

interface MediaStorageImportModalProps {
  open: boolean;
  importable: MediaStorageRecord[];
  loading: boolean;
  importing: boolean;
  onImport: (autoclaveCycleId: number, notes?: string) => Promise<void>;
  onClose: () => void;
}

export function MediaStorageImportModal({
  open,
  importable,
  loading,
  importing,
  onImport,
  onClose,
}: MediaStorageImportModalProps) {
  const [selected, setSelected] = useState<MediaStorageRecord | null>(null);
  const [notes, setNotes] = useState('');

  const handleClose = () => {
    if (importing) return;
    setSelected(null);
    setNotes('');
    onClose();
  };

  const handleImport = async () => {
    if (!selected?.autoclaveCycleId) return;
    await onImport(selected.autoclaveCycleId, notes.trim() || undefined);
    setSelected(null);
    setNotes('');
  };

  if (!open) return null;

  return (
    <ModalLayout
      isOpen={open}
      onClose={handleClose}
      title={selected ? 'Import to Storage' : 'Import from Autoclave'}
      maxWidth="640px"
    >
      {selected ? (
        <div className="p-6 space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
            <p className="text-sm text-muted-foreground">Media Code</p>
            <p className="font-semibold text-lg">{selected.mediaCode}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {selected.mediaType || '—'} · {selected.bottlesCount ?? 0} bottles
              {selected.volumeMl ? ` · ${selected.volumeMl} ml` : ''}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              disabled={importing}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSelected(null)} disabled={importing}>
              Back
            </Button>
            <Button onClick={handleImport} disabled={importing} className="bg-green-600 hover:bg-green-700">
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Select a completed autoclave cycle to import into storage.
          </p>
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading completed cycles...</div>
          ) : importable.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed rounded-lg text-sm text-muted-foreground">
              No completed autoclave cycles available for import.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden divide-y max-h-[400px] overflow-y-auto">
              {importable.map((item) => (
                <div
                  key={item.autoclaveCycleId}
                  className="flex justify-between items-center px-4 py-3 hover:bg-green-50/50 cursor-pointer transition-colors"
                  onClick={() => setSelected(item)}
                >
                  <div>
                    <p className="font-semibold">{item.mediaCode}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.mediaType || '—'} · {item.bottlesCount ?? 0} bottles
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="pointer-events-none">
                    Select <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          </div>
        </div>
      )}
    </ModalLayout>
  );
}

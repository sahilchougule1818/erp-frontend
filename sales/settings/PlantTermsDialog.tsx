import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../shared/ui/dialog';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import { Textarea } from '../../shared/ui/textarea';
import { Plus, Trash2, Save } from 'lucide-react';

interface PlantTermsDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { plant_name: string; terms: string[] }) => Promise<void>;
  onDelete?: (plantName: string) => Promise<void>;
  defaultValues?: { plant_name: string; terms: string };
}

export const PlantTermsDialog: React.FC<PlantTermsDialogProps> = ({
  open,
  onClose,
  onSubmit,
  onDelete,
  defaultValues
}) => {
  const [plantName, setPlantName] = useState('');
  const [terms, setTerms] = useState<string[]>([]);
  const [currentTerm, setCurrentTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && defaultValues) {
      setPlantName(defaultValues.plant_name);
      const termsArray = defaultValues.terms.split('\n').filter(t => t.trim());
      setTerms(termsArray);
    } else if (open && !defaultValues) {
      setPlantName('');
      setTerms([]);
      setCurrentTerm('');
    }
  }, [open, defaultValues]);

  const handleAddTerm = () => {
    if (currentTerm.trim()) {
      setTerms([...terms, currentTerm.trim()]);
      setCurrentTerm('');
    }
  };

  const handleRemoveTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!plantName.trim()) {
      alert('Please enter plant name');
      return;
    }
    if (terms.length === 0) {
      alert('Please add at least one term');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({ plant_name: plantName, terms });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!defaultValues) return;
    if (!window.confirm(`Delete all terms for "${defaultValues.plant_name}"?`)) return;
    
    try {
      setLoading(true);
      await onDelete?.(defaultValues.plant_name);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 border-b flex-shrink-0">
          <DialogTitle>{defaultValues ? 'Edit Plant Terms' : 'Add Plant Terms'}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <Label>
              Plant Name<span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              placeholder="Enter plant name"
              disabled={!!defaultValues}
            />
          </div>

          <div className="space-y-2">
            <Label>Add Terms (One at a time)</Label>
            <div className="flex gap-2">
              <Textarea
                value={currentTerm}
                onChange={(e) => setCurrentTerm(e.target.value)}
                placeholder="Enter a term..."
                rows={2}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    handleAddTerm();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddTerm}
                className="bg-green-600 hover:bg-green-700 self-start"
                disabled={!currentTerm.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">Press Ctrl+Enter to add term quickly</p>
          </div>

          {terms.length > 0 && (
            <div className="space-y-2">
              <Label>Terms List ({terms.length})</Label>
              <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                {terms.map((term, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50">
                    <span className="text-sm font-medium text-gray-500 mt-1 min-w-[30px]">
                      {index + 1}.
                    </span>
                    <p className="flex-1 text-sm text-gray-700 mt-1">{term}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTerm(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t flex-shrink-0">
          <div>
            {defaultValues && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Plant Terms
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !plantName.trim() || terms.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Terms'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

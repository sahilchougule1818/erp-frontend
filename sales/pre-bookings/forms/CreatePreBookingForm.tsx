import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Input } from '../../../shared/ui/input';
import { Button } from '../../../shared/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { FULFILLMENT_TYPES } from '../../constants/EventTypes';
import { Customer } from '../../services/salesApi';
import { usePlantMaster } from '../../../indoor/settings/hooks/usePlantMaster';
import { useCustomers } from '../../hooks/useCustomers';

type OrderItemRow = {
  plant_id: string;
  plant_name: string;
  unit_amount: string;
  quantity: string;
  stock_source?: string;
  source_stage?: string;
  source_phase?: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
}

const EMPTY_ITEM: OrderItemRow = { 
  plant_id: '',
  plant_name: '', 
  unit_amount: '', 
  quantity: '',
  stock_source: FULFILLMENT_TYPES.STOCK_FROM_INDOOR,
  source_stage: '',
  source_phase: '',
};

export const CreatePreBookingForm: React.FC<Props> = ({
  open, onClose, onSubmit,
}) => {
  const { plants } = usePlantMaster();
  const { customers: customersList } = useCustomers({ pageSize: 500 });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  
  const [customerId, setCustomerId] = React.useState('');
  const [deliveryCharges, setDeliveryCharges] = React.useState('0');
  const [cgstPercent, setCgstPercent] = React.useState('0');
  const [sgstPercent, setSgstPercent] = React.useState('0');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = React.useState('');
  const [items, setItems] = React.useState<OrderItemRow[]>([{ ...EMPTY_ITEM }]);

  const customers = customersList || [];

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      setCustomerId('');
      setDeliveryCharges('0');
      setCgstPercent('0');
      setSgstPercent('0');
      setExpectedDeliveryDate('');
      setItems([{ ...EMPTY_ITEM }]);
      setErrorMessage(null);
    }
  }, [open]);

  const calculateItemTotal = (item: OrderItemRow): number => {
    const unitAmount = parseFloat(item.unit_amount) || 0;
    const qty = parseFloat(item.quantity) || 0;
    return unitAmount * qty;
  };

  const grandTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const taxableAmount = grandTotal + (parseFloat(deliveryCharges) || 0);
  const cgstAmount = taxableAmount * ((parseFloat(cgstPercent) || 0) / 100);
  const sgstAmount = taxableAmount * ((parseFloat(sgstPercent) || 0) / 100);
  const finalTotal = taxableAmount + cgstAmount + sgstAmount;

  const updateItem = (idx: number, patch: Partial<OrderItemRow>) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, ...patch } : item));
  };

  const addItem = () => {
    setItems(prev => [...prev, { ...EMPTY_ITEM }]);
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (!customerId) {
        setErrorMessage('Please select a customer');
        setIsSubmitting(false);
        return;
      }

      if (!expectedDeliveryDate) {
        setErrorMessage('Please select expected delivery date');
        setIsSubmitting(false);
        return;
      }

      const validItems = items.filter(item => {
        if (!item.plant_id || !item.plant_name || !item.unit_amount || parseFloat(item.unit_amount) <= 0) return false;
        if (!item.quantity || parseFloat(item.quantity) <= 0) return false;
        return true;
      });

      if (validItems.length === 0) {
        setErrorMessage('Please fill in at least one complete order item');
        setIsSubmitting(false);
        return;
      }

      const payload: any = {
        customer_id: customerId,
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: expectedDeliveryDate,
        delivery_charges: parseFloat(deliveryCharges) || 0,
        cgst_percent: parseFloat(cgstPercent) || 0,
        sgst_percent: parseFloat(sgstPercent) || 0,
        items: validItems.map((item) => {
          const stockSource = item.stock_source || FULFILLMENT_TYPES.STOCK_FROM_INDOOR;
          let source_phase = null;
          let source_stage = null;

          if (stockSource === FULFILLMENT_TYPES.STOCK_FROM_INDOOR) {
            if (item.source_stage === 'Rooting') {
              source_phase = 'Rooting';
              source_stage = null;
            } else if (item.source_stage?.startsWith('Stage-')) {
              source_phase = 'Incubation';
              source_stage = item.source_stage;
            }
          } else if (stockSource === FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR) {
            const phaseMap: Record<string, string> = {
              'Primary': 'Primary Hardening',
              'Secondary': 'Secondary Hardening',
              'Holding': 'Holding Area'
            };
            source_phase = phaseMap[item.source_phase || ''] || null;
            source_stage = null;
          }

          return {
            plant_name: item.plant_name,
            unit_amount: parseFloat(item.unit_amount),
            stock_source: stockSource,
            quantity: parseFloat(item.quantity),
            source_phase,
            source_stage,
          };
        }),
      };

      await onSubmit(payload);
      onClose();
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || error?.message || 'Failed to create pre-booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogHeader className="pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-lg font-semibold">Create Pre-Booking</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <span className="text-red-600 text-base font-medium flex-1">{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Customer */}
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Customer *</label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(customers || []).filter((c) => !c.is_deleted).map((c) => (
                      <SelectItem key={c.customer_id} value={c.customer_id}>
                        {c.name} ({c.customer_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expected Delivery Date */}
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Expected Delivery Date *</label>
                <Input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                />
              </div>

              {/* Order Items */}
              <div className="col-span-2 space-y-4">
                <label className="text-sm font-medium">Order Items *</label>
                {items.map((item, itemIdx) => {
                  const itemTotal = calculateItemTotal(item);
                  return (
                    <div key={itemIdx} className="border rounded-lg p-4 bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-base">Item {itemIdx + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={items.length === 1}
                          onClick={() => removeItem(itemIdx)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Plant Name - FIRST */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Plant Name *</label>
                        <Select 
                          value={item.plant_id} 
                          onValueChange={(value) => {
                            const selectedPlant = plants.find(p => p.id.toString() === value);
                            updateItem(itemIdx, { 
                              plant_id: value, 
                              plant_name: selectedPlant?.plant_name || '',
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select plant" />
                          </SelectTrigger>
                          <SelectContent>
                            {(plants || []).filter(p => p.is_active).map((plant) => (
                              <SelectItem key={plant.id} value={plant.id.toString()}>
                                {plant.plant_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Stock Source and Stage/Phase - SECOND ROW */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Stock Source *</label>
                          <Select 
                            value={item.stock_source || FULFILLMENT_TYPES.STOCK_FROM_INDOOR}
                            onValueChange={(value) => updateItem(itemIdx, { 
                              stock_source: value,
                              source_stage: '',
                              source_phase: '',
                            })}
                            disabled={!item.plant_id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={FULFILLMENT_TYPES.STOCK_FROM_INDOOR}>🏭 Indoor</SelectItem>
                              <SelectItem value={FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR}>🌳 Outdoor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">
                            {item.stock_source === FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR ? 'Source Phase *' : 'Source Stage *'}
                          </label>
                          <Select 
                            value={item.stock_source === FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR ? item.source_phase : item.source_stage}
                            onValueChange={(value) => {
                              if (item.stock_source === FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR) {
                                updateItem(itemIdx, { source_phase: value });
                              } else {
                                updateItem(itemIdx, { source_stage: value });
                              }
                            }}
                            disabled={!item.stock_source || !item.plant_id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={item.plant_id ? "Select stage/phase" : "Select plant first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {item.stock_source === FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR ? (
                                <>
                                  <SelectItem value="Primary">Primary Hardening</SelectItem>
                                  <SelectItem value="Secondary">Secondary Hardening</SelectItem>
                                  <SelectItem value="Holding">Holding Area</SelectItem>
                                </>
                              ) : (
                                <>
                                  <SelectItem value="Stage-0">Incubation - Stage 0</SelectItem>
                                  <SelectItem value="Stage-1">Incubation - Stage 1</SelectItem>
                                  <SelectItem value="Stage-2">Incubation - Stage 2</SelectItem>
                                  <SelectItem value="Stage-3">Incubation - Stage 3</SelectItem>
                                  <SelectItem value="Stage-4">Incubation - Stage 4</SelectItem>
                                  <SelectItem value="Stage-5">Incubation - Stage 5</SelectItem>
                                  <SelectItem value="Stage-6">Incubation - Stage 6</SelectItem>
                                  <SelectItem value="Stage-7">Incubation - Stage 7</SelectItem>
                                  <SelectItem value="Stage-8">Incubation - Stage 8</SelectItem>
                                  <SelectItem value="Rooting">Rooting (Terminal)</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Quantity and Rate per Unit */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Quantity *</label>
                          <Input
                            type="number"
                            step="1"
                            placeholder="Enter quantity"
                            value={item.quantity}
                            onChange={(e) => updateItem(itemIdx, { quantity: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Rate per Unit (₹) *</label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.unit_amount}
                            onChange={(e) => updateItem(itemIdx, { unit_amount: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600">
                          Item Total:{' '}
                          <span className="font-bold text-lg text-gray-900">
                            ₹{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}

                <Button type="button" variant="outline" onClick={addItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add Another Item
                </Button>

                {/* Delivery Charges */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 uppercase">Delivery</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={deliveryCharges}
                    onChange={(e) => setDeliveryCharges(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* CGST */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 uppercase">CGST (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={cgstPercent}
                      onChange={(e) => setCgstPercent(e.target.value)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Amount: ₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* SGST */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 uppercase">SGST (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={sgstPercent}
                      onChange={(e) => setSgstPercent(e.target.value)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Amount: ₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-base text-blue-900">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold">
                      ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-base text-blue-900">
                    <span>Delivery Charges:</span>
                    <span className="font-semibold">
                      ₹
                      {(parseFloat(deliveryCharges) || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="border-t border-blue-300 pt-2">
                    <div className="flex justify-between text-base text-blue-900">
                      <span>Taxable Amount:</span>
                      <span className="font-semibold">
                        ₹{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  {((parseFloat(cgstPercent) || 0) > 0 || (parseFloat(sgstPercent) || 0) > 0) && (
                    <>
                      <div className="flex justify-between text-sm text-blue-800">
                        <span>CGST ({(parseFloat(cgstPercent) || 0).toFixed(2)}%):</span>
                        <span className="font-medium">
                          ₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-blue-800">
                        <span>SGST ({(parseFloat(sgstPercent) || 0).toFixed(2)}%):</span>
                        <span className="font-medium">
                          ₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="border-t-2 border-blue-400 pt-2">
                    <div className="flex justify-between text-lg text-blue-900">
                      <span className="font-bold">Grand Total:</span>
                      <span className="font-bold text-2xl">
                        ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? 'Creating...' : 'Create Pre-Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

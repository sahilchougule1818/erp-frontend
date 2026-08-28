import React, { useEffect, memo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../shared/ui/dialog';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import { Textarea } from '../../shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { Trash2 } from 'lucide-react';
import { cn } from '../../shared/ui/utils';

export type FieldType =
  | 'text' | 'number' | 'date' | 'time' | 'datetime'
  | 'email' | 'password' | 'textarea' | 'select'
  | 'checkbox' | 'radio' | 'custom';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: any; label: string }>;
  validation?: any;
  defaultValue?: any;
  /** Custom render — receives the RHF field object AND current form values */
  render?: (field: any, formValues: any) => React.ReactNode;
  gridColumn?: string; // e.g. 'col-span-2'
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  showWhen?: (formValues: any) => boolean;
}

export interface SharedFormProps {
  open: boolean;
  title: string;
  onClose: () => void;

  // Form fields (optional — omit for shell / lifecycle panels)
  fields?: FieldConfig[];
  onSubmit?: (data: any) => void;
  defaultValues?: any;
  sections?: Array<{ title: string; fields: string[] }>;

  // Delete button
  onDelete?: (id: any) => void;
  deleteLabel?: string;

  // Button labels
  submitLabel?: string;
  cancelLabel?: string;

  // Dialog sizing
  maxWidth?: string;
  height?: string;

  // ── Layout slot props ──────────────────────────────────────────────────────
  /** Node rendered to the RIGHT of the dialog title (e.g. balance widget) */
  titleSuffix?: React.ReactNode;
  /** Node rendered BELOW the title inside DialogHeader (booking ID chip, customer name) */
  headerContent?: React.ReactNode;
  /** Node rendered BEFORE the fields grid inside the scrollable body */
  bodyPrefix?: React.ReactNode;
  /** Node rendered AFTER the fields grid inside the scrollable body */
  bodySuffix?: React.ReactNode;
  /**
   * Full custom body content.
   * When provided, replaces the fields grid entirely.
   * Use for lifecycle panels (ManageInstantSaleDialog, etc.)
   */
  children?: React.ReactNode;
  /**
   * Node rendered ABOVE the footer buttons but OUTSIDE the scrollable body.
   * Ideal for cancel-confirmation panels and error banners that must stay fixed.
   */
  footerContent?: React.ReactNode;
  /**
   * Buttons rendered on the LEFT side of the standard footer
   * (e.g. Delete Sale, Cancel Sale).
   */
  extraActions?: React.ReactNode;
  /**
   * Completely replaces the standard footer (cancel + delete + submit).
   * Use for lifecycle dialogs with complex footer logic.
   */
  customFooter?: React.ReactNode;

  // Submit control
  hideSubmit?: boolean;
  submitDisabled?: boolean;

  /** Called every time any form value changes — useful for computing submitDisabled in parent */
  onFormChange?: (values: any) => void;
}

export const SharedForm = memo(function SharedForm({
  open,
  title,
  onClose,
  fields = [],
  onSubmit,
  defaultValues,
  sections,
  onDelete,
  deleteLabel = 'Delete',
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  maxWidth = 'max-w-2xl',
  height,
  titleSuffix,
  headerContent,
  bodyPrefix,
  bodySuffix,
  children,
  footerContent,
  extraActions,
  customFooter,
  hideSubmit = false,
  submitDisabled = false,
  onFormChange,
}: SharedFormProps) {
  const isFormMode = fields.length > 0;

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<any>({
    defaultValues: fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.defaultValue ?? '',
    }), {}),
  });

  const formValues = watch();

  // Notify parent of form value changes
  useEffect(() => {
    if (onFormChange) onFormChange(formValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(formValues)]);

  // Reset on defaultValues change or when dialog opens
  useEffect(() => {
    if (open) {
      if (defaultValues) {
        reset(defaultValues);
      } else {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        reset(fields.reduce((acc, field) => ({
          ...acc,
          [field.name]: field.defaultValue ?? '',
        }), {}));
      }
    }
  }, [open, defaultValues, reset]); 

  const renderField = useCallback((field: FieldConfig) => {
    if (field.showWhen && !field.showWhen(formValues)) return null;

    const rules: any = {};
    if (field.required) rules.required = `${field.label} is required`;
    if (field.validation) Object.assign(rules, field.validation);

    return (
      <div key={field.name} className={`space-y-2 ${field.gridColumn || ''}`}>
        <Label>
          {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        <Controller
          name={field.name}
          control={control}
          rules={rules}
          render={({ field: cf }) => {
            // ── Custom render ───────────────────────────────────────────────
            if (field.render) {
              return <>{field.render(cf, formValues)}</>;
            }

            // ── Select ──────────────────────────────────────────────────────
            if (field.type === 'select') {
              return (
                <Select value={cf.value} onValueChange={cf.onChange} disabled={field.disabled}>
                  <SelectTrigger className={errors[field.name] ? 'border-red-400' : ''}>
                    <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={String(opt.value)} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }

            // ── Textarea ────────────────────────────────────────────────────
            if (field.type === 'textarea') {
              return (
                <Textarea
                  {...cf}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  rows={field.rows || 3}
                  className={errors[field.name] ? 'border-red-400' : ''}
                />
              );
            }

            // ── Checkbox ────────────────────────────────────────────────────
            if (field.type === 'checkbox') {
              return (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...cf}
                    checked={Boolean(cf.value)}
                    disabled={field.disabled}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-base text-gray-600">{field.placeholder}</span>
                </div>
              );
            }

            // ── Default input ───────────────────────────────────────────────
            return (
              <Input
                {...cf}
                type={field.type}
                placeholder={field.placeholder}
                disabled={field.disabled}
                min={field.min}
                max={field.max}
                step={field.step}
                className={errors[field.name] ? 'border-red-400' : ''}
              />
            );
          }}
        />
        {errors[field.name] && (
          <p className="text-base text-red-600">{errors[field.name]?.message as string}</p>
        )}
      </div>
    );
  }, [formValues, control, errors]);

  const renderFields = useCallback(() => {
    if (!isFormMode) return null;

    if (sections) {
      return sections.map((section, idx) => (
        <div key={idx} className="space-y-4">
          {section.title && (
            <h3 className="font-semibold text-base text-gray-700 border-b pb-2">{section.title}</h3>
          )}
          <div className="grid grid-cols-2 gap-4">
            {section.fields.map((fieldName) => {
              const field = fields.find((f) => f.name === fieldName);
              return field ? renderField(field) : null;
            })}
          </div>
        </div>
      ));
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => renderField(field))}
      </div>
    );
  }, [isFormMode, sections, fields, renderField]);

  // ── Footer ──────────────────────────────────────────────────────────────────
  const standardFooter = (
    <div className="flex items-center justify-between gap-3 pt-4 border-t flex-shrink-0">
      <div className="flex gap-2">
        {extraActions}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {cancelLabel}
        </Button>
        {onDelete && defaultValues && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(defaultValues.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteLabel}
          </Button>
        )}
        {!hideSubmit && (
          <Button
            type={isFormMode ? 'submit' : 'button'}
            onClick={!isFormMode ? () => onSubmit?.({}) : undefined}
            disabled={submitDisabled}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  );

  // ── Inner content (shared between form/shell mode) ──────────────────────────
  const inner = (
    <>
      {/* Header */}
      <DialogHeader className="pb-4 border-b flex-shrink-0">
        {titleSuffix ? (
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            {titleSuffix}
          </div>
        ) : (
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        )}
        {headerContent}
      </DialogHeader>

      {/* Scrollable body */}
      <div className="py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
        {bodyPrefix}
        {children ?? (
          <>
            {renderFields()}
            {bodySuffix}
          </>
        )}
      </div>

      {/* Fixed footer area (cancel confirmation, errors, etc.) */}
      {footerContent}

      {/* Footer buttons */}
      {customFooter ?? standardFooter}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(maxWidth, height, 'max-h-[90vh] flex flex-col')}>
        {isFormMode ? (
          <form
            onSubmit={handleSubmit((data) => onSubmit?.(data))}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            {inner}
          </form>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {inner}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

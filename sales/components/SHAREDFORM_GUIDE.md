# SharedForm - Universal Form Component

## Overview
SharedForm is a powerful, flexible form component that handles 90% of form use cases across all modules. It supports both simple forms and complex lifecycle dialogs.

## Location
`/shared/components/SharedForm.tsx`

## Features
- ✅ React Hook Form integration
- ✅ Field validation
- ✅ Multiple field types (text, number, date, select, textarea, checkbox, custom)
- ✅ Conditional field visibility
- ✅ Section grouping
- ✅ Custom layouts (header, body, footer slots)
- ✅ Delete functionality
- ✅ OTP/verification flows
- ✅ Lifecycle management (for booking/order flows)

## Basic Usage

```typescript
import { SharedForm } from '../../shared/components/SharedForm';

<SharedForm
  open={isOpen}
  title="Create Operator"
  onClose={() => setIsOpen(false)}
  fields={[
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'Enter first name'
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'operator', label: 'Operator' },
        { value: 'supervisor', label: 'Supervisor' }
      ]
    }
  ]}
  onSubmit={(data) => {
    // Handle form submission
    console.log(data);
  }}
  submitLabel="Create"
/>
```

## Advanced Usage - Sections

```typescript
<SharedForm
  open={isOpen}
  title="Create Batch"
  fields={[
    { name: 'batchCode', label: 'Batch Code', type: 'text', required: true },
    { name: 'plantName', label: 'Plant Name', type: 'text', required: true },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'notes', label: 'Notes', type: 'textarea', rows: 3 }
  ]}
  sections={[
    {
      title: 'Basic Information',
      fields: ['batchCode', 'plantName']
    },
    {
      title: 'Details',
      fields: ['quantity', 'notes']
    }
  ]}
  onSubmit={handleSubmit}
/>
```

## Conditional Fields

```typescript
fields={[
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    options: [
      { value: 'indoor', label: 'Indoor' },
      { value: 'outdoor', label: 'Outdoor' }
    ]
  },
  {
    name: 'tunnelNumber',
    label: 'Tunnel Number',
    type: 'text',
    showWhen: (formValues) => formValues.type === 'outdoor'
  }
]}
```

## Custom Render

```typescript
{
  name: 'customField',
  label: 'Custom Field',
  type: 'custom',
  render: (field, formValues) => (
    <div>
      <CustomComponent {...field} data={formValues} />
    </div>
  )
}
```

## Lifecycle Dialogs (Complex)

```typescript
<SharedForm
  open={isOpen}
  title="Manage Booking"
  titleSuffix={<BalanceWidget amount={remaining} />}
  headerContent={<BookingIdChip id={bookingId} />}
  bodyPrefix={<StatusTimeline steps={steps} />}
  customFooter={
    <div className="flex justify-between w-full">
      <Button onClick={handleCancel}>Cancel Booking</Button>
      <Button onClick={handleComplete}>Complete</Button>
    </div>
  }
>
  {/* Custom body content */}
  <PaymentHistory payments={payments} />
</SharedForm>
```

## Props Reference

### Core Props
- `open: boolean` - Dialog open state
- `title: string` - Dialog title
- `onClose: () => void` - Close handler
- `fields?: FieldConfig[]` - Form fields
- `onSubmit?: (data: any) => void` - Submit handler
- `defaultValues?: any` - Initial form values

### Field Configuration
- `name: string` - Field name
- `label: string` - Field label
- `type: FieldType` - Field type
- `required?: boolean` - Required validation
- `placeholder?: string` - Placeholder text
- `options?: Array<{value, label}>` - For select fields
- `showWhen?: (formValues) => boolean` - Conditional visibility
- `render?: (field, formValues) => ReactNode` - Custom render
- `validation?: any` - Custom validation rules

### Layout Slots
- `titleSuffix?: ReactNode` - Right of title
- `headerContent?: ReactNode` - Below title
- `bodyPrefix?: ReactNode` - Before fields
- `bodySuffix?: ReactNode` - After fields
- `footerContent?: ReactNode` - Above buttons
- `extraActions?: ReactNode` - Left side buttons
- `customFooter?: ReactNode` - Replace entire footer

### Delete
- `onDelete?: (id) => void` - Delete handler
- `deleteLabel?: string` - Delete button text

### Styling
- `maxWidth?: string` - Dialog max width
- `height?: string` - Dialog height

## Migration Guide

### Before (Custom Form - 150 lines)
```typescript
// indoor/operators/forms/OperatorForm.tsx
export function OperatorForm({ open, onClose, onSubmit, defaultValues }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  
  const handleSubmit = () => {
    if (!firstName || !lastName) {
      notify.error('Please fill all fields');
      return;
    }
    onSubmit({ firstName, lastName, role });
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Operator</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>First Name</Label>
            <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### After (SharedForm - 30 lines)
```typescript
// indoor/operators/containers/OperatorMaster.tsx
import { SharedForm } from '../../../shared/components/SharedForm';

<SharedForm
  open={isOpen}
  title="Create Operator"
  onClose={() => setIsOpen(false)}
  fields={[
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'role', label: 'Role', type: 'select', required: true,
      options: [
        { value: 'operator', label: 'Operator' },
        { value: 'supervisor', label: 'Supervisor' }
      ]
    }
  ]}
  onSubmit={handleSubmit}
  defaultValues={selectedOperator}
  onDelete={selectedOperator ? handleDelete : undefined}
/>
```

**Result: 120 lines eliminated per form!**

## When NOT to Use SharedForm

- Forms with highly complex custom layouts
- Forms with dynamic field generation based on external data
- Forms that need real-time field interdependencies beyond showWhen

In these cases, create a custom form but consider using SharedForm's field rendering logic.

## Examples in Codebase

See these files for real-world usage:
- `/sales/bookings/components/CreateBookingDialog.tsx`
- `/sales/customers/containers/CustomerSection.tsx`
- `/sales/bank-accounts/containers/BankAccountSection.tsx`

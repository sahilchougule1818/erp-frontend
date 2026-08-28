import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={200}>{children}</TooltipPrimitive.Provider>;
}

export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          style={{
            zIndex: 9999,
            maxWidth: 260,
            borderRadius: 8,
            backgroundColor: '#1e293b',
            padding: '8px 12px',
            fontSize: 12,
            color: '#f8fafc',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          {content}
          <TooltipPrimitive.Arrow style={{ fill: '#1e293b' }} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

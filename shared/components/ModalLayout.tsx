import { ReactNode } from 'react';

interface ModalLayoutProps {
  isOpen?: boolean;
  onClose?: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
  maxWidth?: string;
  maxHeight?: string;
  icon?: ReactNode;
}

export function ModalLayout({
  isOpen = true,
  onClose,
  title,
  subtitle,
  children,
  width,
  maxWidth = '600px',
  maxHeight = 'max-h-[90vh]',
  icon
}: ModalLayoutProps) {
  if (!isOpen) return null;

  const widthValue = width || maxWidth;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border p-0 shadow-lg flex flex-col" style={{ maxHeight: '85vh', minHeight: '200px', width: widthValue }}>
        <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            {icon}
            <h4 className="text-lg font-semibold">{title}</h4>
          </div>
          {subtitle && <p className="text-base text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

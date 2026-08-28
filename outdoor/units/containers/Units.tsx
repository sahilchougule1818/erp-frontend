import { PHTunnelsTab } from '../../settings/components/PHTunnelsTab';
import { SHUnitsTab } from '../../settings/components/SHUnitsTab';

interface UnitsProps {
  type: 'ph' | 'sh';
}

export function Units({ type }: UnitsProps) {
  return type === 'ph' ? <PHTunnelsTab /> : <SHUnitsTab />;
}

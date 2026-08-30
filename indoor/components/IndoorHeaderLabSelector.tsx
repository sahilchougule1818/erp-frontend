import { LabSelector } from '../../shared/components/LabSelector';
import { useLabContext } from '../contexts/LabContext';

export function IndoorHeaderLabSelector() {
  const { labNumber, setLabNumber, isLocked } = useLabContext();

  return (
    <div className="flex items-center justify-end shrink-0">
      {isLocked ? (
        <span className="text-sm font-medium text-slate-600">
          Lab {labNumber}
        </span>
      ) : (
        <LabSelector value={labNumber} onChange={setLabNumber} />
      )}
    </div>
  );
}

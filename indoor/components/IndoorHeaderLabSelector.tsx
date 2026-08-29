import { LabSelector } from '../../shared/components/LabSelector';
import { useLabContext } from '../contexts/LabContext';

export function IndoorHeaderLabSelector() {
  const { labNumber, setLabNumber, isLocked } = useLabContext();

  return (
    <div className="pr-4 border-r border-gray-200">
      {isLocked ? (
        <span className="text-sm font-medium text-slate-600">Lab {labNumber}</span>
      ) : (
        <LabSelector value={labNumber} onChange={setLabNumber} />
      )}
    </div>
  );
}

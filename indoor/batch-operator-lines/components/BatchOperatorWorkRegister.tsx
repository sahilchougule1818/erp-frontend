import { useCallback, useEffect, useMemo, useState } from 'react';
import { indoorApi } from '../../api/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import { BatchMasterTable } from '../../batch-master/components/BatchMasterTable';
import { BatchOperatorLineEditModal } from './BatchOperatorLineEditModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import type { BatchOperatorLine } from '../../types';

interface BatchOperatorWorkRegisterProps {
  batchOptions?: string[];
  stageOptions?: string[];
}

function groupKey(line: BatchOperatorLine) {
  return `${line.sourceTable}:${line.sourceRecordId}:${line.eventCode}`;
}

export function BatchOperatorWorkRegister({
  batchOptions = [],
  stageOptions = [],
}: BatchOperatorWorkRegisterProps) {
  const { labNumber } = useLabContext();
  const [batchCode, setBatchCode] = useState('');
  const [stage, setStage] = useState('');
  const [lines, setLines] = useState<BatchOperatorLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLines, setEditingLines] = useState<BatchOperatorLine[] | null>(null);

  const fetchLines = useCallback(async () => {
    if (!batchCode) {
      setLines([]);
      return;
    }
    setLoading(true);
    try {
      const res = await indoorApi.batchOperatorLines.get({
        batchCode,
        stage: stage || undefined,
        labNumber,
      });
      setLines(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to fetch operator work register', err);
      setLines([]);
    } finally {
      setLoading(false);
    }
  }, [batchCode, stage, labNumber]);

  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  const derivedBatchOptions = useMemo(() => {
    if (batchOptions.length > 0) return batchOptions;
    return [...new Set(lines.map(line => line.batchCode))].sort();
  }, [batchOptions, lines]);

  const derivedStageOptions = useMemo(() => {
    if (stageOptions.length > 0) return stageOptions;
    return [...new Set(lines.map(line => line.stage))].sort();
  }, [stageOptions, lines]);

  const handleEdit = (record: BatchOperatorLine) => {
    const key = groupKey(record);
    const group = lines.filter(line => groupKey(line) === key);
    setEditingLines(group.length > 0 ? group : [record]);
  };

  const columns = [
    {
      key: 'recordDate',
      label: 'Date',
      render: (val: string) => <span>{val ? String(val).split('T')[0] : '—'}</span>,
    },
    {
      key: 'phase',
      label: 'Phase',
      render: (val: string) => <span className="capitalize">{val || '—'}</span>,
    },
    { key: 'stage', label: 'Stage' },
    { key: 'operatorShortName', label: 'Operator' },
    { key: 'qtyIn', label: 'In' },
    { key: 'qtyOut', label: 'Out' },
    {
      key: 'qtyContaminated',
      label: 'Contaminated',
      render: (val: number) => (
        <span className={Number(val) > 0 ? 'text-red-600' : ''}>
          {Number(val ?? 0).toLocaleString()}
        </span>
      ),
    },
    { key: 'state', label: 'State' },
  ];

  return (
    <>
      <BatchMasterTable
        title="Operator Work Register"
        description={!batchCode ? 'Select a batch to view operator work.' : undefined}
        columns={columns}
        records={loading || !batchCode ? [] : lines}
        onEdit={handleEdit}
        filterConfig={{
          filter1Key: 'operatorShortName',
          filter1Label: 'Operator',
          filter2Key: 'phase',
          filter2Label: 'Phase',
        }}
        exportFileName="operator_work_register"
        hideBorder={true}
        addButton={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={batchCode || undefined} onValueChange={setBatchCode}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Batch name" />
              </SelectTrigger>
              <SelectContent>
                {derivedBatchOptions.map(code => (
                  <SelectItem key={code} value={code}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stage || 'all'} onValueChange={(value) => setStage(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {derivedStageOptions.map(value => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {editingLines && (
        <BatchOperatorLineEditModal
          lines={editingLines}
          onClose={() => setEditingLines(null)}
          onSuccess={fetchLines}
        />
      )}
    </>
  );
}

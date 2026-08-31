import { useCallback, useEffect, useMemo, useState } from 'react';
import { indoorApi } from '../../api/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import { BatchMasterTable } from '../../batch-master/components/BatchMasterTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import type { BatchOperatorLine } from '../../types';

interface BatchOperatorWorkRegisterProps {
  batchOptions?: string[];
  stageOptions?: string[];
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
    if (lines.length > 0) {
      return [...new Set(lines.map(line => line.stage))].sort();
    }
    if (stageOptions.length > 0) return stageOptions;
    return [];
  }, [stageOptions, lines]);

  const columns = [
    {
      key: 'recordDate',
      label: 'Date',
      render: (val: string) => <span>{val ? String(val).split('T')[0] : '—'}</span>,
    },
    {
      key: 'batchCode',
      label: 'Batch',
      render: (val: string, record: BatchOperatorLine) => (
        <span className={val !== batchCode ? 'text-indigo-700 font-medium' : ''}>
          {val || '—'}
          {val && val !== batchCode ? ' (split)' : ''}
        </span>
      ),
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
    {
      key: 'qtyUsed',
      label: 'Used',
      render: (val: number, record: BatchOperatorLine) => (
        <span className="font-medium">
          {Number(val ?? (record.qtyOut ?? 0) - (record.qtyContaminated ?? 0)).toLocaleString()}
        </span>
      ),
    },
    { key: 'state', label: 'State' },
  ];

  return (
    <>
      <BatchMasterTable
        title="Operator Work Register"
        description={
          !batchCode
            ? 'Select a batch to view operator work.'
            : 'Includes partial multiplication and rooting splits linked via batch_splits.'
        }
        columns={columns}
        records={loading || !batchCode ? [] : lines}
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
    </>
  );
}

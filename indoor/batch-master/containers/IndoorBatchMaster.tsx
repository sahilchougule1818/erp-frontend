import { BatchMasterTable } from '../components/BatchMasterTable';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Button } from '../../../shared/ui/button';
import {
  Download,
  Plus,
  MoreHorizontal,
  Microscope,
  TestTube,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Clock,
  Lock,
  GitMerge,
  GitBranch
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../../shared/ui/dropdown-menu';
import { useIndoorBatchMaster } from '../hooks/useIndoorBatchMaster';
import { BatchOperatorWorkRegister } from '../../batch-operator-lines/components/BatchOperatorWorkRegister';
import { useNotify } from '../../../shared/hooks/useNotify';
import { cn } from '../../../shared/ui/utils';
import { Tooltip, TooltipProvider } from '../../../shared/ui/tooltip';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { CreateBatchForm } from '../forms/CreateBatchForm';
import { MultiplicationForm } from '../../multiplication/forms/MultiplicationForm';
import { IncubationForm } from '../../incubation/forms/IncubationForm';
import { SampleForm } from '../../sampling/forms/SampleForm';
import { ReportSampleForm } from '../../sampling/forms/ReportSampleForm';
import { MakeAvailableConfirm } from '../forms/MakeAvailableConfirm';
import { PartialRootingForm } from '../../rooting/forms/PartialRootingForm';
import { PartialMultiplicationForm } from '../../multiplication/forms/PartialMultiplicationForm';
import { FullRootingForm } from '../../rooting/forms/FullRootingForm';
import { indoorApi } from '../../api/indoorApi';
import { extractApiErrorMessage } from '../../../shared/api/apiClient';
import { useLabContext } from '../../contexts/LabContext';
import { useAuth } from '../../../auth/AuthContext';
import { Batch } from '../../types';
import { BatchTimelineModal } from '../components/BatchTimelineModal';

type ModalType = 'CREATE' | 'MULTIPLICATION' | 'PARTIAL_MULTIPLICATION' | 'INCUBATE' | 'SAMPLE' | 'REPORT' | 'EXPORT' | 'TIMELINE' | 'PARTIAL_ROOTING' | 'FULL_ROOTING' | 'TERMINAL_INCUBATION' | null;

const IndoorBatchMaster: React.FC = () => {
  const {
    batches,
    operators,
    loading,
    pagination,
    fetchBatches,
    fetchOperators,
    createBatch,
    recordMultiplication,
    recordIncubation,
    submitSample,
    reportSampleResult,
    exportToOutdoor,
    unexportFromOutdoor,
    previewUndo,
    undoLastAction,
    getBatchTimeline
  } = useIndoorBatchMaster();

  const { user } = useAuth();
  const { labNumber } = useLabContext();
  const notify = useNotify();

  const getCreatedBy = () => {
    const id = user?.userId ? parseInt(String(user.userId), 10) : NaN;
    return Number.isFinite(id) ? id : undefined;
  };

  // Helper to get lock reason for actions
  const getActionLockReason = (action: string, batch: Batch): string | null => {
    // Universal locks
    if (isSoldOut(batch)) {
      return 'Batch is sold out - no actions available';
    }
    if (batch.state !== 'ACTIVE' && action !== 'UNEXPORT') {
      if (batch.state === 'OUTDOOR_READY') {
        return 'Batch is marked for outdoor - unmark first to perform actions';
      }
      if (batch.state === 'AT_OUTDOOR') {
        return 'Batch is currently at outdoor module';
      }
      return 'Batch is not active - action locked';
    }

    const stageNum = parseInt(batch.stage?.split('-')[1] || '0');
    const isTerminalBatch = isTerminal(batch);

    switch (action) {
      case 'MULTIPLICATION':
        if (isTerminalBatch) {
          return 'Terminal incubation batches cannot be multiplied';
        }
        if (batch.stage === 'Stage-8' && batch.phase === 'incubation') {
          return 'Cannot multiply from Stage-8 incubation - this is the final stage';
        }
        if (batch.phase !== 'initialisation' && batch.phase !== 'multiplication' && batch.phase !== 'incubation') {
          return 'Multiplication only available in initialisation, multiplication or incubation phase';
        }
        if (batch.phase === 'initialisation') {
          return null;
        }
        if (stageNum >= 0 && stageNum <= 8 && batch.phase !== 'incubation' && batch.phase !== 'multiplication') {
          return 'Stage 0-8 can only be multiplied when in incubation or multiplication phase';
        }
        return null;
      
      case 'INCUBATE':
        if (isTerminalBatch) {
          return 'Terminal incubation batches cannot be incubated again';
        }
        if (stageNum < 0 || stageNum > 8) {
          return 'Incubation only available for Stage 0-8';
        }
        if (batch.phase !== 'multiplication') {
          return 'Can only incubate when in multiplication phase';
        }
        return null;
      
      case 'SAMPLE':
        if (batch.isSampled !== 'n') {
          return 'Sample already submitted';
        }
        return null;

      case 'REPORT':
        if (batch.isSampled !== 's') {
          return 'Sample not yet submitted';
        }
        return null;
      
      case 'PARTIAL_ROOTING':
        if (batch.phase !== 'incubation') {
          return 'Partial rooting only available from incubation phase';
        }
        if (batch.rooted) {
          return 'Batch is already rooted - rooting only happens once';
        }
        return null;
      
      case 'FULL_ROOTING':
        if (batch.phase !== 'incubation') {
          return 'Full rooting only available from incubation phase';
        }
        if (batch.rooted) {
          return 'Batch is already rooted - rooting only happens once';
        }
        return null;
      
      case 'TERMINAL_INCUBATION':
        if (batch.phase !== 'rooting') {
          return 'Terminal incubation only available from rooting phase';
        }
        return null;
      
      case 'EXPORT':
        if (batch.state === 'OUTDOOR_READY' || batch.state === 'AT_OUTDOOR') {
          return 'Batch already exported to outdoor';
        }
        // Rooting batches can be exported
        if (batch.phase === 'rooting' || batch.stage === 'Rooting') {
          return null;
        }
        if (stageNum < 0) {
          return 'Batch must be at least Stage-0 to export';
        }
        if (batch.eventCount < 1) {
          return 'Batch must have at least one event before export';
        }
        return null;
      
      case 'UNEXPORT':
        if (batch.state !== 'OUTDOOR_READY') {
          return 'Batch is not marked for outdoor';
        }
        return null;
      
      default:
        return null;
    }
  };

  const formatPhaseDisplay = (phase: string): string => {
    switch (phase) {
      case 'initialisation': return 'Initialisation';
      case 'multiplication': return 'Multiplication';
      case 'incubation': return 'Incubation';
      case 'rooting': return 'Rooting';
      case 'partial_rooting': return 'Partial Rooting';
      default: return phase;
    }
  };

  const formatStageDisplay = (stage: string | null, phase: string): string => {
    if (!stage || phase === 'initialisation') return 'Initialisation';
    if (stage === 'Terminal-Incubation') return 'Terminal Incubation';
    const n = stage.replace('Stage-', '');
    if (phase === 'multiplication') return `Stage ${n} - Multiplication`;
    if (phase === 'incubation') return `Stage ${n} - Incubation`;
    if (phase === 'rooting') return `Stage ${n} - Rooting`;
    return stage;
  };

  const formatStateDisplay = (state: string): string => {
    switch (state) {
      case 'ACTIVE': return 'Active';
      case 'OUTDOOR_READY': return 'Outdoor Ready';
      case 'AT_OUTDOOR': return 'At Outdoor';
      case 'SOLD_OUT': return 'Sold Out';
      case 'COMPLETED': return 'Completed';
      default: return state;
    }
  };

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [mediaCodes, setMediaCodes] = useState<string[]>([]);
  const [undoLockReasons, setUndoLockReasons] = useState<Record<string, string[]>>({});
  const [batchPermissions, setBatchPermissions] = useState<Record<string, any>>({});
  const [showAll, setShowAll] = useState(false);

  const handlePageChange = (page: number) => {
    fetchBatches(page);
  };

  const handleDropdownOpen = async (open: boolean, batch: Batch) => {
    if (!open) return;
    
    // Fetch permissions for this batch
    try {
      const response = await indoorApi.batchActions.getPermissions(batch.batchCode);
      const permissions = response.permissions || response.data?.permissions;
      setBatchPermissions(prev => ({ ...prev, [batch.batchCode]: permissions }));
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
    
    // Fetch undo preview (read-only; lock checks avoid FOR UPDATE)
    const preview = await previewUndo(batch.batchCode);
    if (preview.success) {
      const d = preview.data as Record<string, unknown>;
      const reasons: string[] = (d.lockReasons ?? []) as string[] ?? (
        (!d.canUndo || d.isUndoLocked) ? [String(d.message ?? 'Undo locked')] : []
      );
      setUndoLockReasons(prev => ({ ...prev, [batch.batchCode]: reasons }));
    } else if (batch.isSampled === 'c') {
      setUndoLockReasons(prev => ({
        ...prev,
        [batch.batchCode]: ['Sample result has been reported — cannot undo'],
      }));
    } else {
      setUndoLockReasons(prev => ({
        ...prev,
        [batch.batchCode]: [preview.error || 'Unable to check undo status'],
      }));
    }
  };

  // Fetch data when component mounts or lab changes
  React.useEffect(() => {
    fetchBatches(1);
    
    const fetchMediaCodes = async () => {
      try {
        const codes = await indoorApi.autoclave.getMediaCodes();
        setMediaCodes(Array.isArray(codes) ? codes : []);
      } catch (error) {
        console.error('Failed to fetch media codes:', error);
        setMediaCodes(['MS-001', 'MS-002', 'MS-003', 'PDA-001', 'PDA-002', 'YPD-001']);
      }
    };
    
    fetchMediaCodes();
  }, [labNumber, fetchBatches]);

  const openModal = (type: ModalType, batch?: Batch) => {
    if (batch) setSelectedBatch(batch);
    if (type === 'MULTIPLICATION') {
      fetchOperators('MULTIPLICATION');
      indoorApi.autoclave.getMediaCodes()
        .then((codes) => setMediaCodes(Array.isArray(codes) ? codes : []))
        .catch((error) => console.error('Failed to refresh media codes:', error));
    } else if (type === 'INCUBATE' || type === 'TERMINAL_INCUBATION') {
      // Operators are copied from prior phase — no picker needed
    } else if (type === 'PARTIAL_MULTIPLICATION' || type === 'PARTIAL_ROOTING' || type === 'FULL_ROOTING') {
      fetchOperators('INCUBATION');
    }
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedBatch(null);
    setTimelineData([]);
  };

  const handleCreateBatch = async (data: any) => {
    const result = await createBatch(data);
    if (result.success) {
      notify.success('Batch created successfully');
      closeModal();
    } else {
      notify.error(result.error || 'Failed to create batch');
    }
  };

  const handleMultiplication = async (data: any) => {
    if (!selectedBatch) return;
    
    const apiData = {
      mediaCode: data.mediaCode,
      currentBottles: data.currentBottles,
      newBottlesCount: parseInt(data.noOfBottles) || 0,
      notes: data.notes || '',
      operators: data.operators
    };
    
    const result = await recordMultiplication(selectedBatch.batchCode, selectedBatch.phase, apiData);
    if (result.success) {
      notify.success('Multiplication recorded successfully');
      closeModal();
    } else {
      notify.error(result.error || 'Failed to record multiplication');
    }
  };

  const handleIncubation = async (data: any) => {
    if (!selectedBatch) return;

    const apiData = {
      mediaCode: data.mediaCode || undefined,
      incubationPeriod: data.incubationPeriod ? parseInt(data.incubationPeriod) : 7,
      temperature: data.temperature ? parseFloat(data.temperature) : undefined,
      humidity: data.humidity ? parseFloat(data.humidity) : undefined,
      lightIntensity: data.lightIntensity ? parseFloat(data.lightIntensity) : undefined,
    };

    const result = await recordIncubation(selectedBatch.batchCode, apiData);
    if (result.success) {
      notify.success('Incubation recorded successfully');
      closeModal();
    } else {
      notify.error(result.error || 'Failed to record incubation');
    }
  };

  const handleSample = async (data: any) => {
    if (!selectedBatch) return;
    const result = await submitSample(selectedBatch.batchCode, data);
    if (result.success) {
      notify.success('Sample submitted successfully');
      closeModal();
    } else {
      notify.error(result.error || 'Failed to submit sample');
    }
  };

  const handleReportSample = async (data: any) => {
    if (!selectedBatch) return;
    const result = await reportSampleResult(selectedBatch.batchCode, data);
    if (result.success) {
      notify.success('Sample result reported successfully');
      closeModal();
    } else {
      notify.error(result.error || 'Failed to report sample result');
    }
  };

  const handleExportBatch = async () => {
    if (!selectedBatch) return;
    const result = await exportToOutdoor(selectedBatch.batchCode, { notes: '' });
    if (result.success) {
      notify.success('Batch is now available for outdoor module');
      closeModal();
    } else {
      throw new Error(result.error || 'Failed to make batch available');
    }
  };

  const handleUnexportBatch = async (batch: Batch) => {
    if (!confirm(`Remove "${batch.batchCode}" from outdoor availability? This will unlock multiplication and incubation.`)) return;
    const result = await unexportFromOutdoor(batch.batchCode);
    if (result.success) {
      notify.success('Batch removed from outdoor availability');
    } else {
      notify.error(result.error || 'Failed to unmark batch');
    }
  };

  const handleUndo = async (batch: Batch) => {
    const preview = await previewUndo(batch.batchCode);
    if (!preview.success) {
      notify.error(preview.error || 'Failed to check undo status');
      return;
    }

    const { canUndo, isUndoLocked, message } = preview.data;

    if (!canUndo || isUndoLocked) {
      notify.error(message || 'Undo is not available for this batch');
      return;
    }

    if (!confirm(message || `Undo last action for batch ${batch.batchCode}?`)) return;

    const result = await undoLastAction(batch.batchCode);
    if (result.success) {
      notify.success('Last action undone successfully');
    } else {
      notify.error(result.error || 'Failed to undo last action');
    }
  };

  const handlePartialMultiplication = async (data: any) => {
    try {
      await indoorApi.batchOperations.makePartialMultiplication({
        ...data,
        createdBy: getCreatedBy(),
      });
      notify.success('Partial multiplication completed successfully');
      closeModal();
      fetchBatches();
    } catch (error: unknown) {
      notify.error(extractApiErrorMessage(error) || 'Failed to create partial multiplication');
    }
  };

  const handlePartialRooting = async (data: any) => {
    try {
      await indoorApi.rooting.makePartialRooting({
        ...data,
        createdBy: getCreatedBy(),
      });
      notify.success('Partial rooting completed successfully');
      closeModal();
      fetchBatches();
    } catch (error: unknown) {
      notify.error(extractApiErrorMessage(error) || 'Failed to create partial rooting');
    }
  };

  const handleFullRooting = async (data: any) => {
    try {
      await indoorApi.rooting.moveFullBatchToRooting({
        ...data,
        createdBy: getCreatedBy(),
      });
      notify.success(`Full batch moved to rooting: ${data.batchCode}`);
      closeModal();
      fetchBatches();
    } catch (error: unknown) {
      notify.error(extractApiErrorMessage(error) || 'Failed to move batch to rooting');
    }
  };

  const handleMoveToTerminalIncubation = async (data: any) => {
    if (!selectedBatch) return;
    try {
      await indoorApi.rooting.moveToTerminalIncubation(selectedBatch.currentSourceId!, {
        mediaCode: data.mediaCode,
        incubationPeriod: data.incubationPeriod ? parseInt(data.incubationPeriod) : 7,
        temperature: data.temperature ? parseFloat(data.temperature) : undefined,
        humidity: data.humidity ? parseFloat(data.humidity) : undefined,
        lightIntensity: data.lightIntensity ? parseFloat(data.lightIntensity) : undefined,
        notes: data.notes || '',
      });
      notify.success('Batch moved to terminal incubation successfully');
      closeModal();
      fetchBatches();
    } catch (error: any) {
      notify.error(error.response?.data?.message || error.message || 'Failed to move to terminal incubation');
    }
  };

  const handleTimeline = async (batch: Batch) => {
    const result = await getBatchTimeline(batch.batchCode);
    if (result.success) {
      setTimelineData(result.data || []);
      setSelectedBatch(batch);
      setActiveModal('TIMELINE');
    } else {
      notify.error(result.error || 'Failed to load timeline');
    }
  };

  // Initialisation batches have 0 bottles by design — they are NOT sold out
  const isSoldOut = (batch: Batch) =>
    batch.state === 'SOLD_OUT' || ((batch.qtyAvailable ?? 0) <= 0 && batch.phase !== 'initialisation');

  // === VISIBILITY: phase/stage based ===

  const isTerminal = (batch: Batch) => batch.rooted === true || batch.stage === 'Terminal-Incubation';

  const showMultiplication = (batch: Batch) => {
    if (batch.phase === 'rooting') return false;
    if (batch.phase === 'initialisation') return true;
    const n = parseInt(batch.stage?.split('-')[1] || '0');
    return n >= 0 && n <= 8 && batch.phase === 'incubation';
  };

  const showIncubate = (batch: Batch) => {
    if (batch.phase === 'rooting') return false;
    const n = parseInt(batch.stage?.split('-')[1] || '0');
    return n >= 0 && n <= 8 && batch.phase === 'multiplication';
  };

  const showExport = (batch: Batch) => {
    if (batch.state === 'OUTDOOR_READY' || batch.state === 'AT_OUTDOOR') return false;
    // Only terminal incubation batches can be exported
    return batch.phase === 'incubation' && batch.rooted === true;
  };

  const showPartialRooting = (batch: Batch) => batch.phase === 'incubation' && !batch.rooted;
  const showFullRooting = (batch: Batch) => batch.phase === 'incubation' && !batch.rooted;

  const handleExportData = () => {
    const exportData = batches.map(batch => ({
      'Batch Code': batch.batchCode,
      'Plant Name': batch.plantName,
      'Current Age (Days)': batch.currentAge,
      'Phase': formatPhaseDisplay(batch.phase),
      'Stage': batch.stage,
      'Current Bottles': batch.qtyIn,
      'Contamination': batch.qtyContaminated,
      'Events': batch.eventCount
    }));
    notify.error('Export functionality would download Excel file here');
  };

  if (loading) return <div className="p-4">Loading...</div>;

const columns = [
    { key: 'batchCode',             label: 'Batch Code',            render: (v: string) => v },
    { key: 'createdDate',           label: 'Created Date',          render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'plantName',             label: 'Plant Name' },
    { key: 'labNumber',             label: 'Lab',                   render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'qtyAvailable',          label: 'Available Bottles',     highlight: 'green' },
    { key: 'phase',                  label: 'Phase',                 render: (v: string) => formatPhaseDisplay(v) },
    { key: 'stage',                  label: 'Stage',                 render: (v: string, record: any) => formatStageDisplay(v, record.phase) },
    { key: 'currentAge',            label: 'Current Age',           render: (v: number) => `${v} days` },
    { key: 'qtyIn',                 label: 'Current Bottles',       render: (v: number) => v?.toLocaleString() ?? '-' },
    { key: 'qtyContaminated',       label: 'Current Contamination' },
    { key: 'qtyPRooted',           label: 'Current Partial Rooting', render: (v: number) => (v || 0).toLocaleString() },
    { key: 'qtySold',               label: 'Current Stage Sold',    render: (v: number) => (v || 0).toLocaleString() },
    { key: 'isSampled',             label: 'Sampling',              render: (v: string) => v === 'c' ? 'Result Reported' : v === 's' ? 'Sample Sent' : 'Not Sampled' },
    { key: 'state',                  label: 'State' },
    { key: 'totalQtySold',         label: 'Total Bottles Sold',    render: (v: number) => (v || 0).toLocaleString() },
    { key: 'totalQtyContaminated', label: 'Total Contamination' },
    { key: 'totalQtyPRooted',     label: 'Total Partial Rooting', render: (v: number) => (v || 0).toLocaleString() },
    { key: 'eventCount',            label: 'Events' },
    { key: 'partialRooting',     label: 'Partial Rooting',       render: (v: boolean) => v ? 'Yes' : '' },
    { key: 'sourceBatchCode',      label: 'Source Batch',          render: (v: string) => v || '' },
    { key: 'sourceBatchStage',     label: 'Source Stage',          render: (v: string, record: any) => (v && record.sourceBatchCode) ? v : '' },
    {
      key: '_actions',
      label: 'Actions',
      render: (_: any, batch: Batch) => (
        <DropdownMenu onOpenChange={(open: boolean) => handleDropdownOpen(open, batch)}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions for {batch.batchCode}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Timeline - Always visible */}
            <DropdownMenuItem onClick={() => handleTimeline(batch)}>
              <Clock className="mr-2 h-4 w-4 text-gray-600" />
              <span>View Timeline</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Multiplication — initialisation phase OR Stage 0-8 incubation */}
            {batch.phase !== 'partial_rooting' && (batch.phase === 'initialisation' || (parseInt(batch.stage?.split('-')[1] || '0') >= 0 && batch.phase === 'incubation')) && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batchCode];
              const permission = batchPermissions[batch.batchCode]?.canMultiply;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>{batch.phase === 'initialisation' ? 'Multiplication' : 'Continue Multiplication'}</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('MULTIPLICATION', batch)}>
                  <GitMerge className="mr-2 h-4 w-4 text-blue-600" />
                  <span>{batch.phase === 'initialisation' ? 'Multiplication' : 'Continue Multiplication'}</span>
                </DropdownMenuItem>
              );
            })()}
            
            {/* Incubate — from multiplication phase */}
            {batch.phase === 'multiplication' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batchCode];
              const permission = batchPermissions[batch.batchCode]?.canIncubate;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;

              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Incubate</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('INCUBATE', batch)}>
                  <Microscope className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Incubate</span>
                </DropdownMenuItem>
              );
            })()}

            {/* Terminal Incubation — only from rooting phase */}
            {batch.phase === 'rooting' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batchCode];
              const permission = batchPermissions[batch.batchCode]?.canTerminalIncubate;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;

              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Move to Terminal Incubation</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('TERMINAL_INCUBATION', batch)}>
                  <Microscope className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Move to Terminal Incubation</span>
                </DropdownMenuItem>
              );
            })()}

            {/* Partial Multiplication */}
            {batch.phase === 'incubation' && !batch.rooted && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batchCode];
              const permission = batchPermissions[batch.batchCode]?.canPartialMultiply;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;

              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Make Partial Multiplication</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('PARTIAL_MULTIPLICATION', batch)}>
                  <GitMerge className="mr-2 h-4 w-4 text-red-600" />
                  <span>Make Partial Multiplication</span>
                </DropdownMenuItem>
              );
            })()}

            {/* Partial Rooting */}
            {batch.phase === 'incubation' && !batch.rooted && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batchCode];
              const permission = batchPermissions[batch.batchCode]?.canPartialRooting;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;

              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Make Partial Rooting</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('PARTIAL_ROOTING', batch)}>
                  <GitBranch className="mr-2 h-4 w-4 text-red-600" />
                  <span>Make Partial Rooting</span>
                </DropdownMenuItem>
              );
            })()}

            {/* Full Rooting */}
            {batch.phase === 'incubation' && !batch.rooted && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batchCode];
              const permission = batchPermissions[batch.batchCode]?.canFullRooting;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Move Full Batch to Rooting</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('FULL_ROOTING', batch)}>
                  <GitBranch className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Move Full Batch to Rooting</span>
                </DropdownMenuItem>
              );
            })()}

            {/* Submit Sample — alternates with Report */}
            {batch.isSampled === 'n' && batch.phase !== 'partial_rooting' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batchCode];
              const permission = batchPermissions[batch.batchCode]?.canSubmitSample;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Submit Sample</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('SAMPLE', batch)}>
                  <TestTube className="mr-2 h-4 w-4 text-cyan-600" />
                  <span>Submit Sample</span>
                </DropdownMenuItem>
              );
            })()}
            
            {/* Report Sample Result — alternates with Submit Sample */}
            {batch.isSampled === 's' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batchCode];
              const permission = batchPermissions[batch.batchCode]?.canReportSampleResult;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Report Sample Result</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('REPORT', batch)}>
                  <TestTube className="mr-2 h-4 w-4 text-purple-600" />
                  <span>Report Sample Result</span>
                </DropdownMenuItem>
              );
            })()}
            
            <DropdownMenuSeparator />
            
            {/* Export to Outdoor — alternates with Unmark */}
            {batch.state !== 'OUTDOOR_READY' && batch.state !== 'AT_OUTDOOR' && batch.phase !== 'partial_rooting' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batchCode];
              const permission = batchPermissions[batch.batchCode]?.canExportToOutdoor;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Make Available for Outdoor</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('EXPORT', batch)}>
                  <ArrowUpRight className="mr-2 h-4 w-4 text-orange-600" />
                  <span>Make Available for Outdoor</span>
                </DropdownMenuItem>
              );
            })()}
            
            {/* Unmark from Outdoor — alternates with Export */}
            {batch.state === 'OUTDOOR_READY' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batchCode];
              const permission = batchPermissions[batch.batchCode]?.canUnexportFromOutdoor;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Unmark from Outdoor</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => handleUnexportBatch(batch)}>
                  <ArrowDownLeft className="mr-2 h-4 w-4 text-amber-600" />
                  <span>Unmark from Outdoor</span>
                </DropdownMenuItem>
              );
            })()}
            
            <DropdownMenuSeparator />
            {(undoLockReasons[batch.batchCode]?.length ?? 0) > 0 ? (
              <TooltipProvider>
                <Tooltip side="left" content={
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {undoLockReasons[batch.batchCode].map((r, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span style={{ color: '#f87171', marginTop: 1 }}>•</span>
                        <span style={{ color: '#f8fafc' }}>{r}</span>
                      </li>
                    ))}
                  </ul>
                }>
                  <span className="block w-full">
                    <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                      <Lock className="h-4 w-4 mr-2" /> Undo Locked
                    </DropdownMenuItem>
                  </span>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <DropdownMenuItem onClick={() => handleUndo(batch)} className="text-red-600">
                <RotateCcw className="mr-2 h-4 w-4" />
                <span>Undo Last Action</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="p-6">
      <Tabs defaultValue="master" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="master">Indoor Batch Master</TabsTrigger>
          <TabsTrigger value="operator-work">Operator Work</TabsTrigger>
        </TabsList>
        
        <TabsContent value="master">
          <BatchMasterTable
        title="Indoor Batch Master"
        columns={columns}
        records={showAll ? batches.map(batch => ({ ...batch })) : batches.filter(b => b.state === 'ACTIVE').map(batch => ({ ...batch }))}
        filterConfig={{
          filter1Key: 'plantName',
          filter1Label: 'Plant Name',
          filter2Key: 'batchCode',
          filter2Label: 'Batch Code'
        }}
        exportFileName="indoor_batch_master"
        addButton={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAll(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                showAll ? 'erp-accent-bg erp-accent-text border-[#7db86a]' : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showAll ? 'bg-white' : 'bg-gray-400'}`} />
              Show All
            </button>
            <Button onClick={() => openModal('CREATE')}>
              <Plus className="w-4 h-4 mr-2" />Create New Batch
            </Button>
          </div>
        }
        pagination={{
          currentPage: pagination.page || pagination.currentPage || 1,
          totalPages: pagination.totalPages,
          total: pagination.total,
          limit: pagination.limit,
          onPageChange: handlePageChange
        }}
        hideBorder={true}
      />
        </TabsContent>

        <TabsContent value="operator-work">
          <BatchOperatorWorkRegister
            batchOptions={[...new Set(batches.map(batch => batch.batchCode))].sort()}
            stageOptions={[...new Set(batches.map(batch => batch.stage))].sort()}
          />
        </TabsContent>
      </Tabs>

      {/* Modal forms */}
      {activeModal === 'CREATE' && (
        <ModalLayout title="Create New Batch" width="w-[600px]">
          <CreateBatchForm mediaCodes={mediaCodes} onSubmit={handleCreateBatch} onCancel={closeModal} />
        </ModalLayout>
      )}

      {activeModal === 'MULTIPLICATION' && selectedBatch && (
        <ModalLayout title={`Multiplication Batch ${selectedBatch.batchCode}`} width="w-[700px]">
          <MultiplicationForm initialData={null} selectedBatch={selectedBatch} operators={operators} mediaCodes={mediaCodes} onSubmit={handleMultiplication} onCancel={closeModal} />
        </ModalLayout>
      )}

      {activeModal === 'INCUBATE' && selectedBatch && (
        <ModalLayout title={`Incubate Batch ${selectedBatch.batchCode}`} width="w-[700px]">
          <IncubationForm initialData={null} selectedBatch={selectedBatch} onSubmit={handleIncubation} onCancel={closeModal} />
        </ModalLayout>
      )}

      {activeModal === 'SAMPLE' && selectedBatch && (
        <SampleForm batch={selectedBatch} onClose={closeModal} onSubmit={handleSample} />
      )}

      {activeModal === 'REPORT' && selectedBatch && (
        <ReportSampleForm batch={selectedBatch} onClose={closeModal} onSubmit={handleReportSample} />
      )}

      {activeModal === 'EXPORT' && selectedBatch && (
        <ModalLayout title={`Make ${selectedBatch.batchCode} Available for Outdoor`} width="w-[450px]" maxHeight="h-auto">
          <MakeAvailableConfirm batchCode={selectedBatch.batchCode} onConfirm={handleExportBatch} onCancel={closeModal} />
        </ModalLayout>
      )}

      {activeModal === 'PARTIAL_MULTIPLICATION' && selectedBatch && (
        <PartialMultiplicationForm
          record={{
            ...selectedBatch,
            id: selectedBatch.currentSourceId,
          }}
          mediaCodes={mediaCodes}
          operators={operators}
          onSubmit={handlePartialMultiplication}
          onCancel={closeModal}
        />
      )}

      {activeModal === 'PARTIAL_ROOTING' && selectedBatch && (
        <PartialRootingForm
          record={{
            ...selectedBatch,
            id: selectedBatch.currentSourceId,
            remainingBottles: selectedBatch.qtyIn,
            toStage: selectedBatch.stage,
            nextStage: selectedBatch.stage
          }}
          mediaCodes={mediaCodes}
          operators={operators}
          onSubmit={handlePartialRooting}
          onCancel={closeModal}
        />
      )}

      {activeModal === 'FULL_ROOTING' && selectedBatch && (
        <FullRootingForm
          record={{
            ...selectedBatch,
            id: selectedBatch.currentSourceId
          }}
          mediaCodes={mediaCodes}
          operators={operators}
          onSubmit={handleFullRooting}
          onCancel={closeModal}
        />
      )}

      {activeModal === 'TERMINAL_INCUBATION' && selectedBatch && (
        <ModalLayout title={`Terminal Incubation — ${selectedBatch.batchCode}`} width="w-[700px]">
          <IncubationForm
            initialData={null}
            selectedBatch={{
              ...selectedBatch,
              // pre-fill media code from rooted batch if available
              latestMediaCode: selectedBatch.latestMediaCode
            }}
            isTerminalIncubation={true}
            onSubmit={handleMoveToTerminalIncubation}
            onCancel={closeModal}
          />
        </ModalLayout>
      )}

      {activeModal === 'TIMELINE' && selectedBatch && (
        <BatchTimelineModal
          batch={selectedBatch}
          timelineData={timelineData}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default IndoorBatchMaster;

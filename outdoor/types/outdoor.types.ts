// ─── Core batch type — mirrors outdoor.v_batch_master ───────────────────────

export interface Batch {
  currentSourceId?: number;
  batchCode: string;
  plantName: string;
  currentPhase: BatchPhase;
  currentTunnel: string | null;
  initialPlants: number;
  totalMortality: number;
  totalPlants: number;
  availablePlants: number;
  state: 'ACTIVE' | 'HOLDING' | 'SOLD';
  status?: 'active' | 'completed' | 'discarded';
  isInHoldingArea?: boolean;
  isSampled: 'n' | 's' | 'c';
  isSold?: boolean;
  isReserved?: boolean;
  soldPlants: number;
  currentPhaseSold: number;
  currentAge: number;
  phaseDisplay?: string;
  currentAction?: string;
  eventType?: string;
  createdAt: string;
}

// ─── Phase tables ───────────────────────────────────────────────────────────

export interface PhaseRecord {
  id: number;
  batchCode: string;
  plantName: string;
  initialPlants: number;
  mortalityCount: number;
  soldCount: number;
  availablePlants: number;
  trays: TrayItem[] | null;
  eventCode: string;
  arrivedAt: string | null;
  ageAtArrival: number | null;
  currentAge: number | null;
  workers?: WorkerSnapshot[];
  createdAt: string;
}

export interface PrimaryHardeningRecord extends PhaseRecord {
  currentTunnel: string;
  waitingDays?: number;
}

export interface SecondaryHardeningRecord extends PhaseRecord {
  currentTunnel: string;
  previousTunnel?: string | null;
  waitingDays?: number;
  unitIsActive?: boolean;
}

export interface MovementJournalRecord {
  id: number;
  batchCode: string;
  movementType: 'IMPORT' | 'SHIFT' | 'TRANSITION' | 'SALE';
  fromLocation: string | null;
  toLocation: string | null;
  plantsAtEntry: number;
  eventCode: string;
  movedAt: string;
  plantName?: string;
  currentPhase?: BatchPhase;
  currentTunnel?: string | null;
  workers?: WorkerSnapshot[];
}

export interface HoldingAreaRecord extends PhaseRecord {
  sourcePhase: BatchPhase;
  sourceTunnel?: string;
}

// ─── Tunnel / unit settings ───────────────────────────────────────────────────

export interface Tunnel {
  id: number;
  name: string;
  capacity: number;
  currentOccupancy?: number;
  availableSpace?: number;
  isActive?: boolean;
  batches?: any[];
}

// ─── Workers ────────────────────────────────────────────────────────────────

export interface Worker {
  id: number;
  shortName: string;
  firstName: string;
  lastName: string;
  role?: string | null;
  section?: string | null;
  isActive: boolean;
}

export interface WorkerSnapshot {
  workerId: number;
  workerShortname: string;
  firstName: string;
  lastName: string;
}

// ─── Fertilization ──────────────────────────────────────────────────────────

export interface FertilizationRecord {
  id: number;
  batchCode: string;
  plantName: string;
  currentPhase: BatchPhase;
  currentTunnel: string | null;
  fertilizerName: string;
  quantity: number;
  eventCode: string;
  createdAt: string;
  workers?: string | null;
}

// ─── Sampling ───────────────────────────────────────────────────────────────

export interface SamplingSubmission {
  id: number;
  batchCode: string;
  plantName: string;
  currentPhase: BatchPhase;
  currentTunnel: string;
  sampleDate: string;
  notes: string | null;
  plantAgeAtSampling: number | null;
  createdAt: string;
}

export interface SamplingResult {
  id: number;
  batchCode: string;
  receivedDate: string | null;
  status: 'Yes' | 'No';
  certificateNumber: string | null;
  governmentDigitalCode: string | null;
  reason: string | null;
  createdAt: string;
}

// ─── Mortality ────────────────────────────────────────────────────────────────

export interface MortalityHistoryRecord {
  batchCode: string;
  plantName: string;
  phaseTable: string;
  toLocation: string | null;
  mortalityCount: number;
  mortalityReason: string | null;
  recordedAt: string;
  eventCode: string;
}

// ─── Enums / unions ─────────────────────────────────────────────────────────

export type BatchPhase =
  | 'primary_hardening'
  | 'secondary_hardening'
  | 'holding_area';

export type SampledStatus = 'n' | 's' | 'c';

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface ShiftPayload {
  batchCode: string;
  newTunnel?: string;
  newUnit?: string;
  plants?: number;
  mortalityCount?: number;
  reason?: string;
  workers: number[];
  trays?: TrayItem[];
}

export interface TransitionPayload {
  batchCode: string;
  targetPhase: string;
  newTunnel?: string;
  unit?: string;
  plants?: number;
  mortalityCount?: number;
  reason?: string;
  workers: number[];
  trays?: TrayItem[];
}

export interface UndoPayload {
  batchCode: string;
  versionToken?: number;
  relocationTunnel?: string;
}

// ─── Undo types ───────────────────────────────────────────────────────────────

export interface UndoPreview {
  canUndo: boolean;
  isFirstRecord?: boolean;
  isUndoLocked?: boolean;
  lockReasons?: string[];
  previousHasSpace?: boolean;
  undoDescription?: string;
  previousState?: {
    phase: BatchPhase;
    tunnel: string;
    plants: number;
  };
  currentState?: {
    phase: BatchPhase;
    tunnel: string;
    plants: number;
  };
  tunnelOptions?: TunnelOption[];
  autoSelectedTunnel?: string;
  versionToken?: number;
  message?: string;
}

export interface TunnelOption {
  name: string;
  availableSpace: number;
  isOriginal: boolean;
  hasEnoughSpace: boolean;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export interface TrayItem {
  cavityCount: number;
  count: number;
}

export interface DashboardStats {
  primaryCount: number;
  secondaryCount: number;
  holdingCount: number;
  totalMortality: number;
}

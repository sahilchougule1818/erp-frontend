export interface Batch {
  id: number;
  batchCode: string;
  plantName: string;
  phase: string;
  stage: string;
  status?: string;
  qtyIn: number;
  qtyContaminated: number;
  qtySold: number;
  qtyAvailable: number;
  qtyPRooted?: number;
  totalQtyContaminated: number;
  totalQtySold: number;
  totalQtyPRooted?: number;
  currentAge: number;
  phaseDisplay?: string;
  lastEventType: string;
  eventCount: number;
  state: 'ACTIVE' | 'SOLD_OUT' | 'OUTDOOR_READY' | 'AT_OUTDOOR';
  isSampled: 'n' | 's' | 'c';
  labNumber?: number;
  labName?: string;
  currentSourceTable?: string;
  currentSourceId?: number;
  qtyInherited?: number;
  partialRooting?: boolean;
  partialMultiplication?: boolean;
  rooted?: boolean;
  sourceBatchCode?: string;
  sourceBatchStage?: string;
  createdDate?: string;
  latestMediaCode?: string;
  eventCode?: string;
}

export interface MultiplicationRecord {
  id: number;
  batchCode: string;
  plantName: string;
  eventCode: string;
  fromStage: string;
  toStage: string;
  mediaCode: string;
  qtyInherited: number;
  qtyIn: number;
  qtyContaminated?: number;
  qtySold?: number;
  qtyAvailable?: number;
  notes: string;
  state: 'ACTIVE' | 'COMPLETED';
  operatorsEditable?: boolean;
  operatorsEditLockReason?: string | null;
  createdAt: string;
  departedAt: string | null;
  operators?: OperatorRef[];
}

export interface IncubationRecord {
  id: number;
  batchCode: string;
  plantName: string;
  eventCode: string;
  stage: string;
  qtyIn: number;
  qtyContaminated: number;
  qtySold: number;
  qtyAvailable: number;
  incubationPeriod: number;
  temperature: number | null;
  humidity: number | null;
  lightIntensity: number | null;
  state: 'ACTIVE' | 'COMPLETED' | 'SOLD_OUT' | 'OUTDOOR_READY' | 'AT_OUTDOOR';
  createdAt: string;
  departedAt: string | null;
  operators?: OperatorRef[];
  rooted: boolean;
  outdoorMovementStatus: number;
}

export interface ContaminationRecord {
  id?: number;
  batchCode: string;
  plantName: string;
  phase: string;
  stage: string;
  qtyContaminated: number;
  qtyIn?: number;
  qtyAvailable?: number;
  createdAt?: string;
  departedAt?: string | null;
  state?: string;
  eventCode?: string;
  recordDate?: string;
  notes?: string;
  labNumber?: number;
}

export interface Operator {
  id: number;
  shortName: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role?: string;
  section?: string;
  active: boolean;
  createdAt?: string;
}

export interface OperatorRef {
  operatorId: number;
  shortName: string;
  name?: string;
  role: string;
}

export interface SamplingSubmission {
  id: number;
  batchCode: string;
  plantName: string;
  currentStage: string;
  currentPhase: string;
  sampleDate: string;
  notes: string;
  plantAgeAtSampling: number;
}

export interface SamplingResult {
  id: number;
  batchCode: string;
  receivedDate: string;
  status: string;
  certificateNumber: string;
  governmentDigitalCode: string;
  reason: string;
}

export interface UndoPreview {
  canUndo: boolean;
  isFirstRecord: boolean;
  eventType: string;
  message: string;
  previousState?: { phase: string; stage: string; bottles: number };
  currentState?: { phase: string; stage: string; bottles: number };
}

export interface LabConfig {
  id: number;
  labNumber: number;
  labName: string;
  active: boolean;
}

export interface PlantConfig {
  id: number;
  plantName: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BatchOperatorLine {
  id: number;
  batchCode: string;
  phase: string;
  stage: string;
  sourceTable: string;
  sourceRecordId: number;
  eventCode: string;
  operatorId: number;
  operatorShortName: string;
  qtyIn: number;
  qtyOut: number;
  qtyContaminated?: number;
  qtyUsed?: number;
  labNumber?: number;
  recordDate?: string;
  state?: string;
  operatorFirstName?: string;
  operatorLastName?: string;
  editable?: boolean;
  editLockReason?: string | null;
}

export interface MediaStorageRecord {
  id?: number;
  autoclaveCycleId?: number;
  mediaCode: string;
  mediaType?: string;
  bottlesCount?: number;
  volumeMl?: number;
  status?: string;
  importedAt?: string;
  readyAt?: string;
  labNumber?: number;
  notes?: string;
}

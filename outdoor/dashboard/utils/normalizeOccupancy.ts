export type OccupancyBatch = {
  batchCode: string;
  plantName: string;
  availablePlants: number;
  totalMortality: number;
};

export type TunnelOccupancy = {
  name: string;
  capacity: number;
  batches: OccupancyBatch[];
};

function normalizeBatch(raw: Record<string, unknown>): OccupancyBatch {
  return {
    batchCode: String(raw.batchCode ?? raw.batch_code ?? ''),
    plantName: String(raw.plantName ?? raw.plant_name ?? ''),
    availablePlants: Number(raw.availablePlants ?? raw.available_plants ?? 0),
    totalMortality: Number(raw.totalMortality ?? raw.total_mortality ?? 0),
  };
}

function parseBatches(raw: unknown): OccupancyBatch[] {
  if (!raw) {
    return [];
  }

  let list: unknown[] = [];

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  } else if (Array.isArray(raw)) {
    list = raw;
  } else {
    return [];
  }

  return list
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object' && !Array.isArray(item))
    .map(normalizeBatch);
}

function normalizeOccupancyRow(row: unknown): TunnelOccupancy | null {
  if (!row) {
    return null;
  }

  if (Array.isArray(row)) {
    return {
      name: String(row[0] ?? ''),
      capacity: Number(row[1] ?? 0),
      batches: parseBatches(row[2]),
    };
  }

  if (typeof row === 'object') {
    const record = row as Record<string, unknown>;
    if (record.name != null) {
      return {
        name: String(record.name),
        capacity: Number(record.capacity ?? 0),
        batches: parseBatches(record.batches),
      };
    }
  }

  return null;
}

/** Spring native queries return rows as arrays; Node returns keyed objects. */
export function normalizeOccupancy(data: unknown): TunnelOccupancy[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(normalizeOccupancyRow)
    .filter((row): row is TunnelOccupancy => row != null);
}

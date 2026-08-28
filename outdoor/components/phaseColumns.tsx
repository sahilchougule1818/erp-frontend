// ─── Column config interface ──────────────────────────────────────────────────

interface PhaseColumnConfig {
  includeSourcePhase?: boolean;
  includeStockColumns?: boolean;
  tunnelLabel?: string;
}

// ─── Shared column factory ────────────────────────────────────────────────────

export const createPhaseColumns = (config: PhaseColumnConfig = {}) => {
  const {
    includeSourcePhase = false,
    includeStockColumns = false,
    tunnelLabel = 'Tunnel',
  } = config;

  const columns: any[] = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (val: string) => val?.split('T')[0] ?? '',
    },
    { key: 'batchCode', label: 'Batch Code' },
    { key: 'plantName', label: 'Plant Name' },
  ];

  if (includeSourcePhase) {
    columns.push({
      key: 'sourcePhase',
      label: 'Source Phase',
      render: (val: string) => phaseLabel(val),
    });
  }

  columns.push({
    key: includeSourcePhase ? 'sourceTunnel' : 'currentTunnel',
    label: tunnelLabel,
  });

  columns.push(
    {
      key: 'ageAtArrival',
      label: 'Age at Arrival',
      render: (val: number) =>
        val !== null && val !== undefined ? `${val} days` : '—',
    },
    {
      key: 'currentAge',
      label: 'Current Age',
      render: (val: number) =>
        val !== null && val !== undefined ? `${val} days` : '—',
    },
    {
      key: 'trays',
      label: 'Trays',
      render: (val: unknown) => renderTrays(val),
    },
    { key: 'initialPlants', label: 'Initial Plants' },
    { key: 'mortalityCount', label: 'Mortality' },
  );

  if (includeStockColumns) {
    columns.push(
      { key: 'soldCount', label: 'Sold', render: (v: number) => Number(v ?? 0).toLocaleString() },
      { key: 'availablePlants', label: 'Available' },
    );
  }

  columns.push({
    key: 'state',
    label: 'State',
  });

  return columns;
};

// ─── Per-component configs ──────────────────────────────────────────────────────

export const phaseColumnConfigs = {
  primaryHardening: { includeStockColumns: true },
  secondaryHardening: { includeStockColumns: true, tunnelLabel: 'SH Unit' },
  holdingArea: { includeSourcePhase: true, includeStockColumns: true },
} satisfies Record<string, PhaseColumnConfig>;

// ─── Private helpers ──────────────────────────────────────────────────────────

function phaseLabel(val: string): string {
  const map: Record<string, string> = {
    primary_hardening: 'Primary Hardening',
    secondary_hardening: 'Secondary Hardening',
    holding_area: 'Holding Area',
  };
  return map[val] ?? val;
}

function parseTrays(val: unknown): Array<{ cavityCount?: number; count?: number }> {
  if (val == null) return [];

  let trays: unknown = val;
  if (typeof trays === 'string') {
    try {
      trays = JSON.parse(trays);
    } catch {
      return [];
    }
  }

  return Array.isArray(trays) ? trays : [];
}

function renderTrays(val: unknown) {
  const trays = parseTrays(val);
  if (trays.length === 0) return '—';

  return trays.map((tray, index) => {
    const cavityCount = tray.cavityCount ?? (tray as { cavity_count?: number }).cavity_count;
    const count = tray.count;
    return (
      <div key={index}>
        T{cavityCount ?? '—'} × {count ?? '—'}
      </div>
    );
  });
}

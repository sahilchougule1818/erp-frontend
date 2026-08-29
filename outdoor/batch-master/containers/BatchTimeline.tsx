import { useState, useEffect } from 'react';
import { Card } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { FileText, Download, TreePine, Sprout, ArrowRightLeft, Droplet, Box, ChevronDown, ChevronUp } from 'lucide-react';
import { outdoorApi } from '../../api/outdoorApi';
import { useSearchParams } from 'react-router-dom';

const getPhaseIcon = (phase: string) => {
  const phaseStr = phase?.toLowerCase() || '';
  if (phaseStr === 'primary_hardening') return Sprout;
  if (phaseStr === 'secondary_hardening') return TreePine;
  if (phaseStr === 'holding_area') return Box;
  return Sprout;
};

const getPhaseColor = (phase: string) => {
  const phaseStr = phase?.toLowerCase() || '';
  if (phaseStr === 'primary_hardening') return 'bg-green-100 text-green-600';
  if (phaseStr === 'secondary_hardening') return 'bg-blue-100 text-blue-600';
  if (phaseStr === 'holding_area') return 'bg-orange-100 text-orange-600';
  return 'bg-gray-100 text-gray-600';
};

const formatPhaseName = (phase: string) => {
  if (phase === 'primary_hardening') return 'Primary Hardening';
  if (phase === 'secondary_hardening') return 'Secondary Hardening';
  if (phase === 'holding_area') return 'Holding Area';
  return phase;
};

export function BatchTimeline() {
  const [searchParams] = useSearchParams();
  const batchFromUrl = searchParams.get('batch');
  
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batches, setBatches] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (batchFromUrl && batches.some(b => b.batchCode === batchFromUrl)) {
      setSelectedBatch(batchFromUrl);
    }
  }, [batchFromUrl, batches]);

  useEffect(() => {
    if (selectedBatch) {
      fetchTimeline();
      fetchStats();
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
    try {
      const data = await outdoorApi.batchTimeline.getBatches();
      const list = Array.isArray(data) ? data : [];
      setBatches(list);
      if (batchFromUrl && list.some((b: any) => b.batchCode === batchFromUrl)) {
        setSelectedBatch(batchFromUrl);
      } else if (!batchFromUrl && list.length > 0) {
        setSelectedBatch(list[0].batchCode);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
    }
  };

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const data = await outdoorApi.batchTimeline.getTimeline(selectedBatch);
      setTimeline(Array.isArray(data) ? data : []);
      // Auto-expand all events by default
      if (Array.isArray(data)) {
        setExpandedEvents(new Set(data.map((e: any) => e.eventCode)));
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await outdoorApi.batchTimeline.getStats(selectedBatch);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
    }
  };

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const handleExport = () => {
    const html = `<html><head><style>body{font-family:Arial;padding:20px}h1{color:#16a34a}.timeline{margin:20px 0}.event{margin:10px 0;padding:10px;border:1px solid #ddd;border-radius:5px}</style></head><body><h1>Batch Timeline - ${selectedBatch}</h1><div class="timeline">${timeline.map(event => `<div class="event"><h3>${formatPhaseName(event.phase)}</h3><p>Plants: ${event.plantsEntered?.toLocaleString() || 'N/A'}, Tunnel: ${event.tunnel || 'N/A'}</p><small>${new Date(event.createdAt).toLocaleString()}</small></div>`).join('')}</div></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    Object.assign(a, { href: url, download: `batch-timeline-${selectedBatch}.html` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Batch Timeline</h1>
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[200px]">
              <label className="block text-base text-gray-600 mb-2">Select Batch</label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map(b => (
                    <SelectItem key={b.batchCode} value={b.batchCode}>
                      {b.batchCode} — {b.plantName}
                      {b.state !== 'ACTIVE' && <span className="text-xs text-gray-400 ml-1">({b.state})</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {stats && (
              <>
                <div className="border-l border-gray-200 pl-4">
                  <div className="text-base text-gray-600 mb-1">Current Phase</div>
                  <div className="text-base font-semibold text-gray-900">
                    {formatPhaseName(stats.currentPhase) || 'N/A'}
                  </div>
                </div>

                <div className="border-l border-gray-200 pl-4">
                  <div className="text-base text-gray-600 mb-1">Current Tunnel</div>
                  <div className="text-base font-semibold text-gray-900">{stats.currentTunnel || 'N/A'}</div>
                </div>

                <div className="border-l border-gray-200 pl-4">
                  <div className="text-base text-gray-600 mb-1">Current Age</div>
                  <div className="text-base font-semibold text-gray-900">
                    {stats.currentAge ?? 0} days
                  </div>
                </div>

                <div className="border-l border-gray-200 pl-4">
                  <div className="text-base text-gray-600 mb-1">Initial Plants</div>
                  <div className="text-base font-semibold text-gray-900">{stats.plants?.toLocaleString() || 0}</div>
                </div>

                <div className="border-l border-gray-200 pl-4">
                  <div className="text-base text-gray-600 mb-1">Total Mortality</div>
                  <div className="text-base font-semibold text-gray-900">
                    {stats.totalMortality?.toLocaleString() || 0}
                  </div>
                </div>

                <div className="border-l border-gray-200 pl-4">
                  <div className="text-base text-gray-600 mb-1">Net Alive</div>
                  <div className="text-base font-semibold text-gray-900">{stats.totalPlants?.toLocaleString() || 0}</div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <FileText className="w-4 h-4 mr-2" />
              Print Timeline
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading timeline...</div>
        ) : timeline.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No events found for this batch</div>
        ) : (
          <div>
            <h2 className="mb-6 text-xl font-semibold">Outdoor Batch Timeline — {selectedBatch}</h2>
            
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

              <div className="space-y-6">
                {timeline.map((event, idx) => {
                  const Icon = getPhaseIcon(event.phase);
                  const phaseColor = getPhaseColor(event.phase);
                  const isExpanded = expandedEvents.has(event.eventCode);
                  const hasShifts = event.shifts && event.shifts.length > 0;
                  const timeInPhase = event.ageAtArrival !== null && event.ageAtDeparture !== null
                    ? event.ageAtDeparture - event.ageAtArrival
                    : null;

                  return (
                    <div key={event.eventCode} className="relative flex gap-4">
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${phaseColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 pb-6">
                        <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-base">
                                {event.eventType === 'IMPORT' && idx === 0
                                  ? `Import to ${formatPhaseName(event.phase)}`
                                  : `Transition to ${formatPhaseName(event.phase)}`}
                              </h3>
                              {event.tunnel && (
                                <div className="text-sm text-gray-500 mt-1">Initial Tunnel: {event.tunnel}</div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(event.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Main Stats */}
                          <div className="bg-gray-50 rounded-md p-3 mb-3">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-base">
                              <div>
                                <span className="text-gray-500">Plants Entered:</span>
                                <span className="font-semibold text-gray-900 ml-2">
                                  {event.plantsEntered?.toLocaleString() || 0}
                                </span>
                              </div>
                              {event.plantsSold > 0 && (
                                <div>
                                  <span className="text-gray-500">Sold:</span>
                                  <span className="font-semibold text-gray-900 ml-2">
                                    {event.plantsSold.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {event.mortalityCount > 0 && (
                                <div>
                                  <span className="text-gray-500">Mortality:</span>
                                  <span className="font-semibold text-gray-900 ml-2">
                                    {event.mortalityCount.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {event.alivePlants != null && (
                                <div>
                                  <span className="text-gray-500">Alive:</span>
                                  <span className="font-semibold text-gray-900 ml-2">
                                    {event.alivePlants.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Age Metrics */}
                          <div className="flex flex-wrap gap-3 mb-3">
                            {event.ageAtArrival !== null && event.ageAtArrival !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="text-base text-gray-500">Age at Arrival:</span>
                                <span className="text-base font-semibold text-gray-900">
                                  {event.ageAtArrival} days
                                </span>
                              </div>
                            )}
                            {event.ageAtDeparture !== null && event.ageAtDeparture !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="text-base text-gray-500">Age at Departure:</span>
                                <span className="text-base font-semibold text-gray-900">
                                  {event.ageAtDeparture} days
                                </span>
                              </div>
                            )}
                            {timeInPhase !== null && (
                              <div className="flex items-center gap-2">
                                <span className="text-base text-gray-500">Time in Phase:</span>
                                <span className="text-base font-semibold text-gray-900">
                                  {timeInPhase} days
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Tunnel Movements (Shifts) */}
                          {hasShifts && (
                            <div className="border-t border-gray-200 pt-3">
                              <button
                                onClick={() => toggleEventExpansion(event.eventCode)}
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-2"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                Tunnel Movements ({event.shifts.length})
                              </button>

                              {isExpanded && (
                                <div className="space-y-2 mt-2">
                                  {event.shifts.map((shift: any, sIdx: number) => (
                                    <div key={sIdx} className="bg-gray-50 rounded-md p-3 border border-gray-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <ArrowRightLeft className="w-4 h-4 text-purple-500" />
                                          <span className="font-medium text-gray-900">
                                            {shift.fromLocation} → {shift.toLocation}
                                          </span>
                                          <span className="text-base text-gray-500">
                                            ({shift.plants?.toLocaleString()} plants)
                                          </span>
                                        </div>
                                        <span className="text-sm text-gray-400">
                                          {new Date(shift.movedAt).toLocaleDateString()}
                                        </span>
                                      </div>

                                      {/* Fertilizations for this shift */}
                                      {shift.fertilizations && shift.fertilizations.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2 pl-6">
                                          {shift.fertilizations.map((fert: any, fIdx: number) => (
                                            <div
                                              key={fIdx}
                                              className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm"
                                            >
                                              <Droplet className="w-3 h-3 text-gray-600" />
                                              <span className="font-medium text-gray-900">{fert.fertilizerName}</span>
                                              <span className="text-gray-700">({fert.quantity})</span>
                                              <span className="text-gray-600">
                                                • {new Date(fert.applicationDate).toLocaleDateString()}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

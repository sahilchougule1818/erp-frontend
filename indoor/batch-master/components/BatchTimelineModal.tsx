import React from 'react';
import { Button } from '../../../shared/ui/button';
import { FlaskConical, Microscope, Sprout, AlertTriangle, TestTube, LogOut, Beaker, Flame, Sparkles, Clock } from 'lucide-react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { Batch } from '../../types';

interface BatchTimelineModalProps {
  batch: Batch;
  timelineData: any[];
  onClose: () => void;
}

const formatPhaseDisplay = (phase: string): string => {
  switch (phase) {
    case 'initialisation': return 'Initialisation';
    case 'subculturing': return 'Subculturing';
    case 'incubation': return 'Incubation';
    case 'rooting': return 'Rooting';
    case 'partial_rooting': return 'Partial Rooting';
    case 'contamination': return 'Contamination';
    case 'sampling': return 'Sampling';
    case 'export': return 'Export';
    default: return phase;
  }
};

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'SUBCULTURE': return FlaskConical;
    case 'INCUBATE': return Microscope;
    case 'ROOTING_PARTIAL': return Sprout;
    case 'ROOTING_FULL': return Sprout;
    case 'CONTAMINATION': return AlertTriangle;
    case 'SAMPLE': return TestTube;
    case 'EXPORT': return LogOut;
    case 'MEDIA_PREPARE': return Beaker;
    case 'AUTOCLAVE': return Flame;
    case 'CLEAN': return Sparkles;
    default: return Clock;
  }
};

const getEventColor = (eventType: string) => {
  switch (eventType) {
    case 'SUBCULTURE': return 'bg-blue-100 text-blue-600';
    case 'INCUBATE': return 'bg-orange-100 text-orange-600';
    case 'ROOTING_PARTIAL': return 'bg-lime-100 text-lime-600';
    case 'ROOTING_FULL': return 'bg-green-100 text-green-600';
    case 'CONTAMINATION': return 'bg-red-100 text-red-600';
    case 'SAMPLE': return 'bg-purple-100 text-purple-600';
    case 'EXPORT': return 'bg-teal-100 text-teal-600';
    case 'MEDIA_PREPARE': return 'bg-slate-100 text-slate-600';
    case 'AUTOCLAVE': return 'bg-amber-100 text-amber-600';
    case 'CLEAN': return 'bg-sky-100 text-sky-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getEventLabel = (event: any): string => {
  const phaseLabels: { [key: string]: string } = {
    subculturing: 'Subculturing',
    incubation: 'Incubation',
    rooting: 'Rooting',
    contamination: 'Contamination',
    sampling: 'Sampling',
    export: 'Export',
  };

  if (event.event_type === 'EXPORT') {
    return 'Exported to Outdoor';
  }
  if (event.event_type === 'CONTAMINATION') {
    return 'Contamination Event';
  }
  if (event.event_type === 'SAMPLE') {
    return 'Sample Collection';
  }
  if (event.event_type === 'MEDIA_PREPARE') {
    return 'Media Preparation';
  }
  if (event.event_type === 'AUTOCLAVE') {
    return 'Autoclave Sterilization';
  }
  if (event.event_type === 'CLEAN') {
    return 'Cleaning Event';
  }

  const phaseLabel = phaseLabels[event.phase] || event.phase;
  return event.stage ? `${phaseLabel} - ${event.stage}` : phaseLabel;
};

export const BatchTimelineModal: React.FC<BatchTimelineModalProps> = ({
  batch,
  timelineData,
  onClose
}) => {
  return (
    <ModalLayout title={`Indoor Batch Timeline — ${batch.batch_code}`} width="900px">
      <div className="px-6 py-4 space-y-4">
        {/* Batch Summary */}
        <div className="grid grid-cols-3 gap-4 text-base bg-gray-50 p-4 rounded-lg border">
          <div><span className="text-gray-500">Plant: </span><span className="font-medium text-gray-900">{batch.plant_name}</span></div>
          <div><span className="text-gray-500">Stage: </span><span className="font-medium text-gray-900">
            {!batch.stage || batch.phase === 'initialisation' ? 'Initialisation' : batch.stage}
          </span></div>
          <div><span className="text-gray-500">Phase: </span><span className="font-medium text-gray-900">{formatPhaseDisplay(batch.phase)}</span></div>
          <div><span className="text-gray-500">Age: </span><span className="font-medium text-gray-900">{batch.current_age} days</span></div>
          <div><span className="text-gray-500">Bottles: </span><span className="font-medium text-gray-900">{batch.qty_in}</span></div>
          <div><span className="text-gray-500">Loss: </span><span className="font-medium text-gray-900">{batch.qty_contaminated}</span></div>
        </div>

        {timelineData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No events found for this batch</div>
        ) : (
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-4">
              {timelineData.map((event, idx) => {
                const Icon = getEventIcon(event.event_type);
                const colorClass = getEventColor(event.event_type);
                const eventLabel = getEventLabel(event);
                const isExport = event.event_type === 'EXPORT';
                const isContamination = event.event_type === 'CONTAMINATION';
                const isSample = event.event_type === 'SAMPLE';
                const isMainEvent = ['SUBCULTURE', 'INCUBATE', 'ROOTING_PARTIAL', 'ROOTING_FULL'].includes(event.event_type);
                const timeInStage = event.age_at_arrival !== null && event.age_at_departure !== null
                  ? event.age_at_departure - event.age_at_arrival
                  : null;
                
                return (
                  <div key={idx} className="relative flex gap-3">
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className={`bg-white border rounded-lg p-4 shadow-sm ${isExport ? 'border-teal-300 bg-teal-50' : ''}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-base">{eventLabel}</h3>
                              {isExport && (
                                <span className="px-2 py-0.5 bg-teal-600 text-white text-xs font-semibold rounded-full">
                                  Final Event
                                </span>
                              )}
                            </div>
                            {event.lab_number && (
                              <span className="text-sm text-gray-500">Lab {event.lab_number}</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(event.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Main Event Data */}
                        {isMainEvent && (
                          <div className="bg-gray-50 rounded p-3 space-y-2.5 text-base">
                            <div className="grid grid-cols-5 gap-3 py-2">
                              <div className="text-center">
                                <div className="text-base text-gray-400 mb-1">Plants In</div>
                                <div className="font-semibold text-gray-900 text-base">{event.plants_entered?.toLocaleString() || 0}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-base text-gray-400 mb-1">{event.event_type === 'SUBCULTURE' ? 'Loss' : 'Contaminated'}</div>
                                <div className="font-semibold text-gray-900 text-base">{event.mortality_count?.toLocaleString() || 0}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-base text-gray-400 mb-1">Sold</div>
                                <div className="font-semibold text-gray-900 text-base">{event.sold_count?.toLocaleString() || 0}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-base text-gray-400 mb-1">Partially Rooted</div>
                                <div>
                                  {event.phase === 'subculturing' && event.partially_rooted_count > 0 ? (
                                    <span className="font-semibold text-gray-900 text-base">
                                      {event.partially_rooted_count?.toLocaleString()}
                                    </span>
                                  ) : event.partial_rootings && event.partial_rootings.length > 0 ? (
                                    <div className="space-y-1">
                                      {event.partial_rootings.map((pr: any, prIdx: number) => (
                                        <div key={prIdx} className="text-sm">
                                          <span className="font-semibold text-gray-900">Split {pr.split_sequence}:</span>
                                          <span className="text-gray-700 ml-1">{pr.qty_in} in</span>
                                          {pr.qty_contaminated > 0 && (
                                            <span className="text-gray-700 ml-1">({pr.qty_contaminated} lost)</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-base">-</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-base text-gray-400 mb-1">Available</div>
                                <div className="font-semibold text-gray-900 text-base">{event.available_plants?.toLocaleString() || 0}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Contamination Event Details */}
                        {isContamination && (
                          <div className="bg-gray-50 rounded p-3 space-y-2.5 text-base">
                            <div>
                              <span className="text-gray-600">Contaminated Count: </span>
                              <span className="font-semibold text-gray-900">{event.mortality_count || 0}</span>
                            </div>
                          </div>
                        )}

                        {/* Sample Event Details */}
                        {isSample && event.stage && (
                          <div className="bg-gray-50 rounded p-3 space-y-2.5 text-base">
                            <div>
                              <span className="text-gray-600">Sample Type: </span>
                              <span className="font-semibold text-gray-900">{event.stage}</span>
                            </div>
                          </div>
                        )}

                        {/* Export Event Details */}
                        {isExport && (
                          <div className="bg-gray-50 rounded p-3 space-y-2.5 text-base">
                            <div className="text-gray-800">
                              This batch has been exported to the outdoor facility and is no longer in indoor inventory.
                            </div>
                          </div>
                        )}

                        {/* Age Metrics */}
                        <div className="flex flex-wrap items-center gap-3 text-base mt-3">
                          {event.age_at_arrival !== null && event.age_at_arrival !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Age at Arrival:</span>
                              <span className="font-semibold text-gray-900">
                                {event.age_at_arrival} days
                              </span>
                            </div>
                          )}
                          {event.age_at_departure !== null && event.age_at_departure !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Age at Departure:</span>
                              <span className="font-semibold text-gray-900">
                                {event.age_at_departure} days
                              </span>
                            </div>
                          )}
                          {timeInStage !== null && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Time in Stage:</span>
                              <span className="font-semibold text-gray-900">
                                {timeInStage} days
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </ModalLayout>
  );
};

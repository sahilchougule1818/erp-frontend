import React from 'react';
import { Button } from '../../../shared/ui/button';
import { Upload, ArrowRightLeft, ArrowUpRight, Clock } from 'lucide-react';
import type { Batch } from '../../types/outdoor.types';

interface TimelineModalProps {
  batch: Batch;
  timelineData: any[];
  timelineStats: any;
  onClose: () => void;
}

const phaseLabel = (phase: string) => {
  const map: Record<string, string> = {
    primary_hardening: 'Primary Hardening',
    secondary_hardening: 'Secondary Hardening',
    holding_area: 'Holding Area',
  };
  return map[phase] ?? phase;
};

export const TimelineModal: React.FC<TimelineModalProps> = ({
  batch,
  timelineData,
  timelineStats,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border shadow-lg flex flex-col" style={{ width: '850px', maxHeight: '90vh' }}>
        <div className="px-6 pt-6 pb-4 border-b border-gray-300 flex-shrink-0">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-lg font-semibold">Outdoor Batch Timeline — {batch.batch_code}</h4>
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          </div>
          {timelineStats && (
            <div className="grid grid-cols-4 gap-3 text-base">
              <div><span className="text-gray-600">Plant: </span><span className="font-semibold text-gray-900">{batch.plant_name}</span></div>
              <div><span className="text-gray-600">Phase: </span><span className="font-semibold text-gray-900">{phaseLabel(timelineStats.current_phase || batch.current_phase)}</span></div>
              <div><span className="text-gray-600">Tunnel: </span><span className="font-semibold text-gray-900">{timelineStats.current_tunnel || batch.current_tunnel || 'N/A'}</span></div>
              <div><span className="text-gray-600">Age: </span><span className="font-semibold text-gray-900">{timelineStats.current_age ?? batch.current_age ?? 0} days</span></div>
              <div><span className="text-gray-600">Initial Plants: </span><span className="font-semibold text-gray-900">{timelineStats.plants ?? batch.initial_plants ?? 0}</span></div>
              <div><span className="text-gray-600">Current Alive: </span><span className="font-semibold text-gray-900">{timelineStats.available_plants ?? batch.available_plants ?? 0}</span></div>
              <div><span className="text-gray-600">Sold: </span><span className="font-semibold text-gray-900">{timelineStats.sold_plants ?? batch.sold_plants ?? 0}</span></div>
              <div><span className="text-gray-600">Mortality: </span><span className="font-semibold text-gray-900">{timelineStats.total_mortality ?? batch.total_mortality ?? 0}</span></div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ minHeight: 0 }}>
          {timelineData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No events found for this batch</div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {timelineData.map((event, idx) => {
                  const getIcon = () => {
                    if (event.event_type === 'IMPORT') return Upload;
                    if (event.event_type === 'SHIFT') return ArrowRightLeft;
                    if (event.event_type === 'TRANSITION') return ArrowUpRight;
                    return Clock;
                  };
                  const getColor = () => {
                    if (event.event_type === 'IMPORT') return 'bg-green-100 text-green-600';
                    if (event.event_type === 'SHIFT') return 'bg-purple-100 text-purple-600';
                    if (event.event_type === 'TRANSITION') return 'bg-blue-100 text-blue-600';
                    return 'bg-gray-100 text-gray-600';
                  };
                  const Icon = getIcon();
                  const colorClass = getColor();
                  return (
                    <div key={idx} className="relative flex gap-3">
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="bg-white border rounded-lg p-3 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium text-base">
                                {event.event_type === 'IMPORT' && `Import to ${phaseLabel(event.event_data?.phase || event.phase)}`}
                                {event.event_type === 'TRANSITION' && `Transition to ${phaseLabel(event.event_data?.to_phase || event.phase)}`}
                              </h3>
                              {event.age_at_arrival !== null && event.age_at_arrival !== undefined && (
                                <span className="text-base text-gray-500">
                                  Age at Arrival: <span className="font-semibold text-gray-900">{event.age_at_arrival} days</span>
                                </span>
                              )}
                            </div>
                            <div className="text-base text-gray-500">{new Date(event.created_at).toLocaleDateString()}</div>
                          </div>
                          <div className="bg-gray-50 rounded p-3 space-y-2.5 text-base">
                            {event.tunnel && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 min-w-[80px]">Tunnel</span>
                                <span className="font-semibold text-gray-800">{event.tunnel.includes('-') ? event.tunnel.split('-')[1] : event.tunnel}</span>
                              </div>
                            )}
                            {/* Plant counts in horizontal layout */}
                            <div className="grid grid-cols-4 gap-3 py-2">
                              {event.plants_entered && (
                                <div className="text-center">
                                  <div className="text-base text-gray-400 mb-1">Plants Entered</div>
                                  <div className="font-semibold text-gray-900 text-base">{event.plants_entered}</div>
                                </div>
                              )}
                              {event.mortality_count !== null && event.mortality_count !== undefined && (
                                <div className="text-center">
                                  <div className="text-base text-gray-400 mb-1">Mortality</div>
                                  <div className="font-semibold text-gray-900 text-base">{event.mortality_count}</div>
                                </div>
                              )}
                              {event.plants_sold !== null && event.plants_sold !== undefined && (
                                <div className="text-center">
                                  <div className="text-base text-gray-400 mb-1">Plants Sold</div>
                                  <div className="font-semibold text-gray-900 text-base">{event.plants_sold}</div>
                                </div>
                              )}
                              {event.alive_plants !== null && event.alive_plants !== undefined && (
                                <div className="text-center">
                                  <div className="text-base text-gray-400 mb-1">Available Plants</div>
                                  <div className="font-semibold text-gray-900 text-base">{event.alive_plants}</div>
                                </div>
                              )}
                            </div>
                            {/* Age at departure removed from here */}
                            {/* Tunnel shifts section */}
                            {event.shifts && event.shifts.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="text-gray-400 text-base mb-1.5 font-semibold">Tunnel Shifts:</div>
                                {event.shifts.map((shift: any, shiftIdx: number) => (
                                  <div key={shiftIdx} className="flex items-center justify-between text-base mb-1.5 pl-2">
                                    <div className="flex items-center gap-1.5">
                                      <ArrowRightLeft className="w-3 h-3 text-purple-600 flex-shrink-0" />
                                      {shift.movement_type === 'IMPORT' ? (
                                        <span className="font-medium text-gray-800">
                                          → {shift.to_location.includes('-') ? shift.to_location.split('-')[1] : shift.to_location}
                                        </span>
                                      ) : (
                                        <span className="font-medium text-gray-800">
                                          {shift.from_location.includes('-') ? shift.from_location.split('-')[1] : shift.from_location} → {shift.to_location.includes('-') ? shift.to_location.split('-')[1] : shift.to_location}
                                        </span>
                                      )}
                                      <span className="text-gray-500">({shift.plants} plants)</span>
                                      <span className="text-gray-400 text-base">
                                        {new Date(shift.moved_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                    {shift.fertilizations && shift.fertilizations.length > 0 ? (
                                      <div className="flex items-center gap-2">
                                        {shift.fertilizations.map((fert: any, fertIdx: number) => (
                                          <span key={fertIdx} className="text-base text-gray-700">
                                            <span className="font-medium">{fert.fertilizer_name}</span>
                                            <span className="text-gray-500"> ({fert.quantity})</span>
                                            {fert.application_date && (
                                              <span className="text-gray-400 ml-1">
                                                {new Date(fert.application_date).toLocaleDateString()}
                                              </span>
                                            )}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Fertilizations section - removed since now shown inline with shifts */}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

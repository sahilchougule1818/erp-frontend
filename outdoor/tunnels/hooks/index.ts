import { outdoorApi } from '../../services/outdoorApi';
import { usePhaseView } from '../../hardening/hooks/usePhaseView';

export * from './useOutdoorData';

export const useTunnelShiftsData = () =>
  usePhaseView(outdoorApi.phaseViews.getTunnelShifts);

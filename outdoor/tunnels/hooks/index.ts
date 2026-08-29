import { outdoorApi } from '../../api/outdoorApi';
import { usePhaseView } from '../../hardening/hooks/usePhaseView';

export const useTunnelShiftsData = () =>
  usePhaseView(outdoorApi.phaseViews.getTunnelShifts);

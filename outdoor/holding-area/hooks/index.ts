import { outdoorApi } from '../../services/outdoorApi';
import { usePhaseView } from '../../hardening/hooks/usePhaseView';

export const useHoldingAreaData = () =>
  usePhaseView(outdoorApi.phaseViews.getHoldingArea);

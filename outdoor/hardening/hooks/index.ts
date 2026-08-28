import { outdoorApi } from '../../services/outdoorApi';
import { usePhaseView } from './usePhaseView';

export * from './usePhaseView';
export * from './usePhaseEditing';

export const usePrimaryHardeningData = () =>
  usePhaseView(outdoorApi.phaseViews.getPrimaryHardening);

export const useSecondaryHardeningData = () =>
  usePhaseView(outdoorApi.phaseViews.getSecondaryHardening);

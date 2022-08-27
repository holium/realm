import { OnboardingService } from 'os/services/onboarding/onboarding.service';

/**
 * OnboardingActions for interfacing with core process
 */
type OnboardingActionType = typeof OnboardingService.preload;
export const OnboardingActions: OnboardingActionType =
  window.electron.os.onboarding;

import { Account } from './accounts.table';
import { AuthUpdateAccountPayload } from './auth.types';

export type OnboardingEndedPayload = {
  accounts: Account[];
  order: string[];
};

export type OnboardingEnded = {
  type: 'onboarding-ended';
  payload: OnboardingEndedPayload;
};

export type OnboardingAccountAdded = {
  type: 'account-added';
  payload: AuthUpdateAccountPayload;
};

export type OnboardingAccountRemoved = {
  type: 'account-removed';
  payload: AuthUpdateAccountPayload;
};

export type OnboardingAccountUpdated = {
  type: 'account-updated';
  payload: AuthUpdateAccountPayload;
};

export type OnboardingUpdateTypes =
  | OnboardingAccountAdded
  | OnboardingAccountRemoved
  | OnboardingAccountUpdated
  | OnboardingEnded;

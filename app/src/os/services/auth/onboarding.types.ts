import { DBAccount } from './accounts.table';
import { AuthUpdateAccountPayload } from './auth.types';

export type OnboardingEndedPayload = {
  accounts: DBAccount[];
  order: string[];
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

export type RealmInstallVersionTest = {
  success: boolean;
  major: number;
  minor: number;
  build: number;
};

type OnboardingAddServer = {
  type: 'add-server';
};

type OnboardingFinished = {
  type: 'onboarding-finished';
};

export type OnboardingUpdateTypes =
  | OnboardingAccountAdded
  | OnboardingAccountRemoved
  | OnboardingAccountUpdated
  | OnboardingAddServer
  | OnboardingFinished;

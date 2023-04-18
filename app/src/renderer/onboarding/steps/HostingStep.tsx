import { useEffect } from 'react';
import { HostingDialog } from '@holium/shared';
import { track } from '@amplitude/analytics-browser';
import { StepProps } from './types';
import { useAppState } from 'renderer/stores/app.store';
import { observer } from 'mobx-react';

type HostingStepProps = {
  onFinish: () => void;
} & StepProps;

export const HostingStepPresenter = ({
  setStep,
  onFinish,
}: HostingStepProps) => {
  const { authStore } = useAppState();
  useEffect(() => {
    track('Onboarding / Hosting');
  });

  const onBack = () => {
    if (authStore.accounts.length > 0) {
      onFinish();
    } else {
      setStep('/login');
    }
  };

  const onGetHosting = () => {
    localStorage.setItem('isHosted', 'true');
    setStep('/choose-id');
  };

  const onAddExistingServer = () => {
    setStep('/add-server');
  };

  return (
    <HostingDialog
      onBack={onBack}
      onGetHosting={onGetHosting}
      onAddExistingServer={onAddExistingServer}
    />
  );
};

export const HostingStep = observer(HostingStepPresenter);

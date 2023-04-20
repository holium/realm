import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { PassportDialog } from '@holium/shared';
import { FileUploadParams } from 'os/services/ship/ship.service';
import { StepProps } from './types';
import { RealmIPC, ShipIPC } from '../../stores/ipc';

type Props = {
  onFinish?: () => void;
} & StepProps;

export const PassportStep = ({ setStep, onFinish }: Props) => {
  const patp = localStorage.getItem('patp');

  useEffect(() => {
    track('Onboarding / Passport');
  });

  const onUploadFile = async (file: File) => {
    const params: FileUploadParams = {
      source: 'file',
      content: file.path,
      contentType: file.type,
    };
    const url = await ShipIPC.uploadFile(params);

    return url;
  };

  const onBack = () => {
    setStep('/login');
  };

  const handleOnNext = async (
    nickname: string,
    description = '',
    avatar = ''
  ) => {
    if (!patp) return false;

    RealmIPC.updatePassport(patp, nickname, description, avatar);

    const isHosted = localStorage.getItem('isHosted');

    if (isHosted) {
      onFinish?.();
      setStep('/login');
    } else {
      setStep('/password');
    }

    return true;
  };

  return (
    <PassportDialog
      patp={patp}
      onUploadFile={onUploadFile}
      onBack={onBack}
      onNext={handleOnNext}
    />
  );
};

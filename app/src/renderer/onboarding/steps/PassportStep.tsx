import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { PassportDialog, OnboardingStorage } from '@holium/shared';
import { StepProps } from './types';
import { FriendsIPC, RealmIPC } from '../../stores/ipc';
import { FileUploadParams } from '../../../os/services/ship/ship.service';

export const PassportStep = ({ setStep, onFinish }: StepProps) => {
  const { shipId, nickname, description, avatar } = OnboardingStorage.get();

  useEffect(() => {
    track('Onboarding / Passport');
  });

  const onUploadFile = async (file: File) => {
    const params: FileUploadParams = {
      source: 'file',
      content: file.path,
      contentType: file.type,
    };
    const url = await RealmIPC.uploadFile(params);

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
    if (!shipId) return false;

    await RealmIPC.updatePassport(shipId, nickname, description, avatar);

    // Sync friends agent
    FriendsIPC.saveContact(shipId, {
      nickname,
      avatar,
      bio: description,
    });

    OnboardingStorage.set({ nickname, description, avatar });
    const { shipType } = OnboardingStorage.get();

    if (shipType === 'hosted') {
      onFinish?.();
    } else {
      setStep('/installation');
    }

    return true;
  };

  return (
    <PassportDialog
      patp={shipId ?? ''}
      prefilledNickname={nickname ?? ''}
      prefilledDescription={description ?? ''}
      prefilledAvatarSrc={avatar ?? ''}
      onUploadFile={onUploadFile}
      onBack={onBack}
      onNext={handleOnNext}
    />
  );
};
import { useEffect, useState } from 'react';
import { track } from '@amplitude/analytics-browser';

import { OnboardingStorage, PassportDialog } from '@holium/shared';

import { FileUploadParams } from '../../../os/services/ship/ship.service';
import { AuthIPC, RealmIPC } from '../../stores/ipc';
import { StepProps } from './types';

export const PassportStep = ({ setStep, onFinish }: StepProps) => {
  const { shipId, nickname, description, avatar } = OnboardingStorage.get();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(avatar);
  const [descriptionSrc, setDescription] = useState<string | null>(description);
  const [nicknameSrc, setNickname] = useState<string | null>(nickname);
  const [sigilColor, setSigilColor] = useState<string | undefined>('#000000');

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const { shipId, shipCode, shipUrl, passwordHash, clientSideEncryptionKey } =
      OnboardingStorage.get();
    if (
      !shipId ||
      !shipCode ||
      !shipUrl ||
      !passwordHash ||
      !clientSideEncryptionKey
    ) {
      console.error('in bad state');
      return;
    }
    window.onboardingService.setCredentials({
      patp: shipId,
      code: shipCode,
      url: shipUrl,
    });
    window.onboardingService
      .getPassport()
      .then((ourPassport) => {
        setNickname(ourPassport?.nickname);
        setAvatarSrc(ourPassport?.avatar);
        setDescription(ourPassport?.bio);
        setSigilColor(ourPassport?.color);
        setIsReady(true);
      })
      .catch((e) => {
        console.error(e);
        setIsReady(true);
      });
  }, []);
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
    description?: string,
    avatar?: string
  ) => {
    if (!shipId) return false;

    await AuthIPC.updatePassport(
      shipId,
      nickname,
      description,
      avatar,
      sigilColor
    );

    // Sync friends agent
    await window.onboardingService.updatePassport(shipId, {
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
      loading={!isReady}
      prefilledColor={sigilColor}
      prefilledNickname={nicknameSrc ?? ''}
      prefilledDescription={descriptionSrc ?? ''}
      prefilledAvatarSrc={avatarSrc ?? ''}
      onUploadFile={onUploadFile}
      onBack={onBack}
      onNext={handleOnNext}
    />
  );
};

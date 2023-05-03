import { useEffect, useState } from 'react';
import { track } from '@amplitude/analytics-browser';

import { OnboardingStorage, PassportDialog } from '@holium/shared';

import { FileUploadParams } from '../../../os/services/ship/ship.service';
import { AuthIPC, OnboardingIPC, RealmIPC } from '../../stores/ipc';
import { StepProps } from './types';

export const PassportStep = ({ setStep, onFinish }: StepProps) => {
  const { serverId, nickname, description, avatar } = OnboardingStorage.get();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(avatar);
  const [descriptionSrc, setDescription] = useState<string | null>(description);
  const [nicknameSrc, setNickname] = useState<string | null>(nickname);
  const [sigilColor, setSigilColor] = useState<string | undefined>('#000000');

  const [isReady, setIsReady] = useState(false);

  const { serverType } = OnboardingStorage.get();
  const isHoliumHosted = serverType === 'hosted';

  useEffect(() => {
    const {
      serverId,
      serverCode,
      serverUrl,
      passwordHash,
      clientSideEncryptionKey,
    } = OnboardingStorage.get();

    if (
      !serverId ||
      !serverCode ||
      !serverUrl ||
      !passwordHash ||
      !clientSideEncryptionKey
    ) {
      console.error('in bad state');
      return;
    }

    OnboardingIPC.setCredentials({
      serverId: serverId,
      serverCode: serverCode,
      serverUrl: serverUrl,
    });

    OnboardingIPC.getPassport()
      .then((ourPassport) => {
        if (!ourPassport) {
          setIsReady(true);
          return;
        }
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

  const onBack = isHoliumHosted
    ? () => {
        setStep('/credentials');
      }
    : undefined;

  const handleOnNext = async (
    nickname: string,
    description?: string,
    avatar?: string
  ) => {
    if (!serverId) return false;

    const response1 = await AuthIPC.updatePassport(
      serverId,
      nickname,
      description,
      avatar,
      sigilColor
    );

    if (!response1) return false;

    // Sync friends agent
    const response2 = await OnboardingIPC.updatePassport(serverId, {
      nickname,
      avatar,
      bio: description,
    });

    if (!response2) return false;

    OnboardingStorage.set({ nickname, description, avatar });
    const { serverType } = OnboardingStorage.get();

    if (serverType === 'hosted') {
      onFinish?.();
    } else {
      setStep('/installation');
    }

    return true;
  };

  return (
    <PassportDialog
      patp={serverId ?? ''}
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

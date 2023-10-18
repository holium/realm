import { useEffect, useState } from 'react';
import { track } from '@amplitude/analytics-browser';

import { useToggle } from '@holium/design-system/util';
import { OnboardingStorage, PassportDialog } from '@holium/shared';

import { FileUploadParams } from '../../../os/services/ship/ship.service';
import { AuthIPC, OnboardingIPC, RealmIPC } from '../../stores/ipc';
import { StepProps } from './types';

export const PassportStep = ({ setStep }: StepProps) => {
  const { serverId, nickname, description, avatar, serverType } =
    OnboardingStorage.get();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(avatar);
  const [descriptionSrc, setDescription] = useState<string | null>(description);
  const [nicknameSrc, setNickname] = useState<string | null>(nickname);
  const [sigilColor, setSigilColor] = useState<string | undefined>('#000000');

  const loading = useToggle(true);

  const isHoliumHosted = serverType === 'hosted';

  useEffect(() => {
    const { serverId, serverCode, serverUrl, passwordHash } =
      OnboardingStorage.get();

    if (!serverId || !serverCode || !serverUrl || !passwordHash) {
      console.error(
        'in bad state',
        serverId,
        serverCode,
        serverUrl,
        passwordHash
      );
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
          loading.toggleOff();
          return;
        }
        setNickname(ourPassport?.nickname);
        setAvatarSrc(ourPassport?.avatar);
        setDescription(ourPassport?.bio);
        setSigilColor(ourPassport?.color);
        loading.toggleOff();
      })
      .catch((e) => {
        console.error(e);
        loading.toggleOff();
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
    const result = await RealmIPC.uploadFile(params);
    if (!result) return null;

    return result.Location;
  };

  const onBack = () => {
    isHoliumHosted ? setStep('/credentials') : setStep('/installation');
  };

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

    OnboardingIPC.finishOnboarding();

    return true;
  };

  return (
    <PassportDialog
      patp={serverId ?? ''}
      loading={loading.isOn}
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

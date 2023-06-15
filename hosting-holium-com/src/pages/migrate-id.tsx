import { useState } from 'react';

import { OnboardingStorage } from '@holium/shared';

import { MigrateIdDialog } from '../../../shared/src/onboarding/dialogs/MigrateId/MigrateIdDialog';
import { Page } from '../components/Page';
import { thirdEarthApi } from '../util/thirdEarthApi';
import { useNavigation } from '../util/useNavigation';

export default function MigrateId() {
  const { goToPage } = useNavigation();

  const [file, setFile] = useState<File>();
  const [progress, setProgress] = useState<number>();

  const onUpload = async (file: File) => {
    const { token, email, serverId } = OnboardingStorage.get();

    if (!token || !serverId || !email) return;

    setFile(file);

    setProgress(0);

    // TODO: store in payment.
    const provisionalShipId = '';

    // Increment progress by 1% every 2s until 99%.
    const interval = setInterval(() => {
      setProgress((progress) => {
        if (progress === undefined) return 0;

        if (progress < 99) {
          return progress + 1;
        } else {
          clearInterval(interval);
          return progress;
        }
      });
    }, 2000);

    // Call API to start uploading file.
    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('type', 'pier');
    formData.append('patp', serverId);
    formData.append('desks', 'false');
    formData.append('groups', 'false');

    const response = await thirdEarthApi.uploadPierFile(
      token,
      provisionalShipId,
      formData
    );

    if (response) {
      setProgress(100);
      clearInterval(interval);
    }
  };

  const onClickClearUpload = () => {
    setFile(undefined);
    setProgress(undefined);
  };

  const onBack = () => goToPage('/account/get-realm');

  const onNext = () => {
    return goToPage('/account');
  };

  return (
    <Page title="Migrate ID" isProtected>
      <MigrateIdDialog
        fileName={file?.name}
        progress={progress}
        onUpload={onUpload}
        onClickClearUpload={onClickClearUpload}
        onBack={onBack}
        onNext={onNext}
      />
    </Page>
  );
}

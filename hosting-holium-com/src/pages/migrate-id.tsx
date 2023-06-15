import { useState } from 'react';

import { MigrateIdDialog } from '../../../shared/src/onboarding/dialogs/MigrateId/MigrateIdDialog';
import { Page } from '../components/Page';
import { useNavigation } from '../util/useNavigation';

export default function MigrateId() {
  const { goToPage } = useNavigation();

  const [file, setFile] = useState<File>();
  const [progress, setProgress] = useState<number>();

  const onUpload = (file: File) => {
    setFile(file);

    setProgress(0);
  };

  const onClickClearUpload = () => {
    setFile(undefined);
    setProgress(undefined);
  };

  const onBack = () => goToPage('/account/get-realm');

  const onNext = () => {
    return goToPage('/payment');
  };

  return (
    <Page title="Migrate ID" isProtected>
      <MigrateIdDialog
        fileName={file?.name}
        progress={progress}
        setFile={onUpload}
        onClickClearUpload={onClickClearUpload}
        onBack={onBack}
        onNext={onNext}
      />
    </Page>
  );
}

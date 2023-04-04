import { useEffect, useState } from 'react';
import { CredentialsDialog } from '@holium/shared';
import { Page } from 'components/Page';
import { useNavigation } from '../util/useNavigation';

export default function Credentials() {
  const { goToPage } = useNavigation();
  const [credentials, setCredentials] = useState({
    id: '',
    url: '',
    accessCode: '',
  });

  const onBack = () => goToPage('/booting');

  const onNext = () => goToPage('/download');

  useEffect(() => {
    setCredentials({
      id: localStorage.getItem('patp') ?? '',
      url: localStorage.getItem('url') ?? '',
      accessCode: localStorage.getItem('accessCode') ?? '',
    });
  }, []);

  return (
    <Page title="Credentials" isProtected>
      <CredentialsDialog
        credentials={credentials}
        onBack={onBack}
        onNext={onNext}
      />
    </Page>
  );
}

import { useEffect, useState } from 'react';

import { CredentialsDialog, OnboardingStorage } from '@holium/shared';

import { Page } from '../components/Page';
import { useNavigation } from '../util/useNavigation';

export default function Credentials() {
  const { goToPage } = useNavigation();
  const [credentials, setCredentials] = useState({
    id: '',
    url: '',
    accessCode: '',
  });

  const onNext = () => goToPage('/download');

  useEffect(() => {
    const { serverId, serverUrl, serverCode } = OnboardingStorage.get();
    if (!serverId || !serverUrl || !serverCode) return;
    setCredentials({
      id: serverId,
      url: serverUrl,
      accessCode: serverCode,
    });
  }, []);

  return (
    <Page title="Credentials" isProtected>
      <CredentialsDialog credentials={credentials} onNext={onNext} />
    </Page>
  );
}

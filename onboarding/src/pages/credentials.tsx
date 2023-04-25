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
    const { shipId, shipUrl, shipCode } = OnboardingStorage.get();
    if (!shipId || !shipUrl || !shipCode) return;
    setCredentials({
      id: shipId,
      url: shipUrl,
      accessCode: shipCode,
    });
  }, []);

  return (
    <Page title="Credentials" isProtected>
      <CredentialsDialog credentials={credentials} onNext={onNext} />
    </Page>
  );
}

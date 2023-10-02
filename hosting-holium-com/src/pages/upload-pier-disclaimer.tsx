import { UploadPierDisclaimerDialog } from '@holium/shared';

import { Page } from '../components/Page';
import { useNavigation } from '../util/useNavigation';

export default function UploadPierDisclaimer() {
  const { goToPage } = useNavigation();

  const onBack = () => {
    goToPage('/login');
  };

  const onNext = () => {
    goToPage('/payment', {
      product_type: 'byop-p',
    });

    return Promise.resolve(true);
  };

  return (
    <Page title="Disclaimer">
      <UploadPierDisclaimerDialog onBack={onBack} onNext={onNext} />
    </Page>
  );
}

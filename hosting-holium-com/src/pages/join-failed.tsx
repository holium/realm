import { SomethingWentWrongDialog } from '@holium/shared';

import { Page } from '../components/Page';

export default function JoinFailed() {
  const onBack = () => {
    window.location.href = 'https://holium.com';
  };

  return (
    <Page title="Something went wrong">
      <SomethingWentWrongDialog onBack={onBack} />
    </Page>
  );
}

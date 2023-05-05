import { DownloadDialog } from '@holium/shared';

import { Page } from 'components/Page';

import { downloadLinks } from '../util/constants';
import { useNavigation } from '../util/useNavigation';

export default function Download() {
  const { goToPage } = useNavigation();

  const onBack = () => goToPage('/credentials');

  const onNext = () => goToPage('/account');

  const onDownloadMacM1 = () => window.open(downloadLinks.macM1, '_blank');

  const onDownloadMacIntel = () =>
    window.open(downloadLinks.macIntel, '_blank');

  const onDownloadWindows = () => window.open(downloadLinks.windows, '_blank');

  const onDownloadLinux = () => window.open(downloadLinks.linux, '_blank');

  return (
    <Page title="Download Realm for desktop" isProtected>
      <DownloadDialog
        onDownloadMacM1={onDownloadMacM1}
        onDownloadMacIntel={onDownloadMacIntel}
        onDownloadWindows={onDownloadWindows}
        onDownloadLinux={onDownloadLinux}
        onBack={onBack}
        onNext={onNext}
      />
    </Page>
  );
}

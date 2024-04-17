import {
  AccountSupportDialog,
  ThirdEarthAlert,
  UserContextProvider,
  useUser,
} from '@holium/shared';

import { Page } from '../../components/Page';
import { thirdEarthApi } from '../../util/thirdEarthApi';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

export const getServerSideProps = async () => {
  const alerts = await thirdEarthApi.alerts();
  return {
    props: {
      alerts: alerts.alerts,
    },
  };
};

type Props = {
  alerts: ThirdEarthAlert[];
};

const SupportPresenter = ({ alerts }: Props) => {
  const { goToPage, logout } = useNavigation();
  const { ships, selectedShipId, setSelectedShipId } = useUser();

  const onClickSidebarSection = (section: string) => {
    if (section === 'Get Hosting') {
      goToPage(accountPageUrl[section], {
        back_url: '/account/support',
      });
    } else {
      goToPage(accountPageUrl[section]);
    }
  };

  return (
    <AccountSupportDialog
      alerts={alerts}
      ships={ships}
      selectedShipId={selectedShipId}
      setSelectedShipId={setSelectedShipId}
      onClickSidebarSection={onClickSidebarSection}
      onExit={logout}
    />
  );
};

export default function AccountSupportPage({ alerts }: Props) {
  return (
    <Page title="Account / Support" isProtected>
      <UserContextProvider api={thirdEarthApi}>
        <SupportPresenter alerts={alerts} />
      </UserContextProvider>
    </Page>
  );
}

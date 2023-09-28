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

  const onClickUploadPier = () => {
    const byopInProgress = ships.find(
      (ship) => ship.product_type === 'byop-p' && ship.ship_type !== 'planet'
    );

    if (byopInProgress) {
      goToPage('/upload-id', {
        back_url: '/account/support',
      });
    } else {
      goToPage('/upload-id-disclaimer', {
        back_url: '/account/support',
      });
    }
  };

  const onClickPurchaseId = () => {
    goToPage('/choose-id', {
      back_url: '/account/support',
    });
  };

  return (
    <AccountSupportDialog
      alerts={alerts}
      ships={ships}
      selectedShipId={selectedShipId}
      setSelectedShipId={setSelectedShipId}
      onClickPurchaseId={onClickPurchaseId}
      onClickUploadPier={onClickUploadPier}
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

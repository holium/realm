import { AccountGetRealmDialog, UserContextProvider } from '@holium/shared';

import { thirdEarthApi } from 'util/thirdEarthApi';

import { Page } from '../../components/Page';
import { constants } from '../../util/constants';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

export const joinWaitlist = async (email: string) => {
  const response = await fetch(
    'https://api.convertkit.com/v3/forms/4987798/subscribe',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        api_key: constants.CONVERTKIT_API_KEY,
      }),
    }
  );

  return response.ok;
};

const GetRealmPresenter = () => {
  const { goToPage, logout } = useNavigation();

  const onClickUploadPier = () => {
    goToPage('/upload-pier-disclaimer', {
      back_url: '/account/get-realm',
    });
  };

  const onClickPurchaseId = () => {
    goToPage('/choose-id', {
      back_url: '/account/get-realm',
    });
  };

  const onClickSidebarSection = (section: string) => {
    if (section === 'Get Hosting') {
      onClickPurchaseId();
    } else {
      goToPage(accountPageUrl[section]);
    }
  };

  return (
    <AccountGetRealmDialog
      onClickJoinWaitlist={joinWaitlist}
      onClickSidebarSection={onClickSidebarSection}
      onClickPurchaseId={onClickPurchaseId}
      onClickUploadPier={onClickUploadPier}
      onExit={logout}
    />
  );
};

export default function AccountGetRealmPage() {
  return (
    <Page title="Account / Get Realm" isProtected>
      <UserContextProvider api={thirdEarthApi}>
        <GetRealmPresenter />
      </UserContextProvider>
    </Page>
  );
}

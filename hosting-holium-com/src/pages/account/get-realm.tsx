import {
  AccountGetRealmDialog,
  OnboardingStorage,
  UserContextProvider,
} from '@holium/shared';

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

  const onClickMigrateId = () => {
    OnboardingStorage.set({
      productType: 'byop-p',
    });
    goToPage('/payment', {
      back_url: '/account/get-realm',
    });
  };

  const onClickPurchaseId = () => {
    OnboardingStorage.remove('productType');
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
    <Page title="Account / Get Realm" isProtected>
      <AccountGetRealmDialog
        onClickJoinWaitlist={joinWaitlist}
        onClickSidebarSection={onClickSidebarSection}
        onClickPurchaseId={onClickPurchaseId}
        onClickMigrateId={onClickMigrateId}
        onExit={logout}
      />
    </Page>
  );
};

export default function GetRealm() {
  return (
    <Page title="Account / Download Realm" isProtected>
      <UserContextProvider api={thirdEarthApi}>
        <GetRealmPresenter />
      </UserContextProvider>
    </Page>
  );
}

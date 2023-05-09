import { AccountGetRealmDialog, UserContextProvider } from '@holium/shared';

import { thirdEarthApi } from 'util/thirdEarthApi';

import { Page } from '../../components/Page';
import { constants } from '../../util/constants';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

const GetRealmPresenter = () => {
  const { goToPage, logout } = useNavigation();

  const goToGetHosting = () => {
    goToPage(accountPageUrl['Get Hosting'], {
      back_url: '/account/get-realm',
    });
  };

  const onClickSidebarSection = (section: string) => {
    if (section === 'Get Hosting') {
      goToGetHosting();
    } else {
      goToPage(accountPageUrl[section]);
    }
  };

  const onClickJoinWaitlist = async (email: string) => {
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

  return (
    <Page title="Account / Get Realm" isProtected>
      <AccountGetRealmDialog
        onClickGetHosting={goToGetHosting}
        onClickJoinWaitlist={onClickJoinWaitlist}
        onClickSidebarSection={onClickSidebarSection}
        onClickBuyServer={() => {}}
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

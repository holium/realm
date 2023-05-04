import { AccountGetRealmDialog, UserContextProvider } from '@holium/shared';

import { thirdEarthApi } from 'util/thirdEarthApi';

import { Page } from '../../components/Page';
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
    }
    goToPage(accountPageUrl[section]);
  };

  return (
    <Page title="Account / Get Realm" isProtected>
      <AccountGetRealmDialog
        onClickGetHosting={goToGetHosting}
        onClickSidebarSection={onClickSidebarSection}
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

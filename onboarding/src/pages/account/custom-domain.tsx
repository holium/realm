import { useMemo, useState } from 'react';

import { useToggle } from '@holium/design-system/util';
import {
  AccountCustomDomainDialog,
  UserContextProvider,
  useUser,
} from '@holium/shared';

import { Page } from '../../components/Page';
import { thirdEarthApi } from '../../util/thirdEarthApi';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

const CustomDomainPresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { token, ships, selectedPatp, setSelectedPatp } = useUser();

  const submitting = useToggle(false);
  const [domain, setDomain] = useState('');
  const [successMessage, setSuccessMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const ship = useMemo(
    () => ships.find((ship) => ship.patp === selectedPatp),
    [ships, selectedPatp]
  );

  const onSubmit = async () => {
    if (!ship) return;
    if (!token) return;
    if (!domain) return;

    submitting.toggleOn();

    setErrorMessage(undefined);
    setSuccessMessage(undefined);

    const result = await thirdEarthApi.setCustomDomain(
      token,
      domain,
      ship.droplet_id.toString(),
      ship.droplet_ip,
      ship.id.toString(),
      ship.user_id.toString()
    );

    if (result) {
      if (result.checkIp !== ship.droplet_id.toString()) {
        setErrorMessage(
          `The domain you entered does not point to the correct IP address (${ship.droplet_ip}).`
        );
      } else {
        setSuccessMessage(
          `Your domain has been set to ${domain}. It may take a few minutes to propagate.`
        );
      }
    }

    submitting.toggleOff();
  };

  const onClickSidebarSection = (section: string) => {
    goToPage(accountPageUrl[section]);
  };

  return (
    <Page title="Account / Download Realm" isProtected>
      <AccountCustomDomainDialog
        patps={ships.map((ship) => ship.patp)}
        selectedPatp={selectedPatp}
        domain={domain}
        dropletIp={ship?.droplet_ip}
        errorMessage={errorMessage}
        successMessage={successMessage}
        setSelectedPatp={setSelectedPatp}
        onChangeDomain={setDomain}
        onSubmit={onSubmit}
        onClickSidebarSection={onClickSidebarSection}
        onExit={logout}
      />
    </Page>
  );
};

export default function CustomDomain() {
  return (
    <Page title="Account / Custom domain" isProtected>
      <UserContextProvider api={thirdEarthApi}>
        <CustomDomainPresenter />
      </UserContextProvider>
    </Page>
  );
}

import { useMemo, useState } from 'react';
import { AccountCustomDomainDialog } from '@holium/shared';
import { useUser, UserContextProvider } from 'util/UserContext';
import { api } from 'util/api';
import { Page } from '../../components/Page';
import { accountPageUrl, useNavigation } from '../../util/useNavigation';

const CustomDomainPresenter = () => {
  const { goToPage, logout } = useNavigation();
  const { token, ships, selectedPatp, setSelectedPatp } = useUser();

  const [successMessage, setSuccessMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const ship = useMemo(
    () => ships.find((ship) => ship.patp === selectedPatp),
    [ships, selectedPatp]
  );

  const onClickSave = async (domain: string) => {
    if (!ship) return;

    setErrorMessage(undefined);
    setSuccessMessage(undefined);

    const result = await api.setCustomDomain(
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
  };

  const onClickSidebarSection = (section: string) => {
    goToPage(accountPageUrl[section]);
  };

  if (!ship) return null;

  return (
    <Page title="Account / Download Realm" isProtected>
      <AccountCustomDomainDialog
        patps={ships.map((ship) => ship.patp)}
        selectedPatp={selectedPatp}
        dropletIp={ship.droplet_ip}
        errorMessage={errorMessage}
        successMessage={successMessage}
        setSelectedPatp={setSelectedPatp}
        onClickSave={onClickSave}
        onClickSidebarSection={onClickSidebarSection}
        onExit={logout}
      />
    </Page>
  );
};

export default function CustomDomain() {
  return (
    <Page title="Account / Custom domain" isProtected>
      <UserContextProvider>
        <CustomDomainPresenter />
      </UserContextProvider>
    </Page>
  );
}

import { useState } from 'react';

import { useToggle } from '@holium/design-system/util';
import { AccountCustomDomainDialogBody, useUser } from '@holium/shared';

import { thirdEarthApi } from 'renderer/onboarding/thirdEarthApi';
import { MobXAccount } from 'renderer/stores/models/account.model';

import { SettingSection } from '../../components/SettingSection';

type Props = {
  account: MobXAccount;
};

export const AccountCustomDomainSection = ({ account }: Props) => {
  const submitting = useToggle(false);
  const [domain, setDomain] = useState('');

  const { token, ships } = useUser();

  const [successMessage, setSuccessMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const ship = ships.find((ship) => ship.patp === account.serverId);

  const onSubmit = async () => {
    if (!ship) return false;
    if (!token) return false;
    if (!domain) return false;

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

        submitting.toggleOff();
        return true;
      }
    }

    submitting.toggleOff();
    return false;
  };

  return (
    <SettingSection
      title="Custom server domain"
      body={
        <AccountCustomDomainDialogBody
          dropletIp={ship?.droplet_ip}
          errorMessage={errorMessage}
          successMessage={successMessage}
          domain={domain}
          submitting={submitting.isOn}
          onChangeDomain={setDomain}
        />
      }
      hideSubmitButton
      onSubmit={onSubmit}
    />
  );
};

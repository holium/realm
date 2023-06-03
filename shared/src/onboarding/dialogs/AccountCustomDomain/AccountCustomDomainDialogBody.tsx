import { FormEvent } from 'react';
import styled from 'styled-components';

import { ErrorBox, Flex, SuccessBox } from '@holium/design-system/general';
import { Input } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import { AccountDialogDescription } from '../../components/AccountDialog.styles';
import { SubmitButton } from '../../onboarding';

const DomainInput = styled(Input)`
  display: block;
  width: 100%;
  line-height: 32px;
  text-align: center;
`;

type Props = {
  domain: string;
  submitting: boolean;
  dropletIp: string | undefined;
  errorMessage: string | undefined;
  successMessage: string | undefined;
  onChangeDomain: (domain: string) => void;
};

export const AccountCustomDomainDialogBody = ({
  domain,
  submitting,
  dropletIp,
  errorMessage,
  successMessage,
  onChangeDomain,
}: Props) => {
  const disabled = useToggle(true);

  const onChangeInput = (event: FormEvent<HTMLInputElement>) => {
    const parts = event.currentTarget.value.split('.');
    const isValidDomain =
      parts.length > 1 && parts[0].length > 0 && parts[1].length > 0;
    disabled.setToggle(!isValidDomain);
    onChangeDomain(event.currentTarget.value);
  };

  return (
    <>
      <AccountDialogDescription>
        You may use a domain name you already own or control as an alternate
        address for this ship. The domain name must be set to resolve to{' '}
        {dropletIp}.
      </AccountDialogDescription>
      <AccountDialogDescription>
        Once it is resolving to the correct IP, enter the domain name here.
      </AccountDialogDescription>
      <Flex flexDirection="column" alignItems="flex-end" gap="8px">
        <DomainInput
          placeholder="my.domain.com"
          value={domain}
          onChange={onChangeInput}
        />
        <SubmitButton
          text="Save"
          submitting={submitting}
          disabled={disabled.isOn}
        />
      </Flex>
      {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
      {successMessage && <SuccessBox>{successMessage}</SuccessBox>}
    </>
  );
};

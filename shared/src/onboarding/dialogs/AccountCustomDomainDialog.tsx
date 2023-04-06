import { FormEvent, useRef } from 'react';
import styled from 'styled-components';
import {
  ErrorBox,
  SuccessBox,
  Flex,
  Input,
  useToggle,
} from '@holium/design-system';
import { AccountDialog, SidebarSection } from '../components/AccountDialog';
import { AccountDialogDescription } from '../components/AccountDialog.styles';
import { SubmitButton } from '../components/hosting/SubmitButton';

const DomainInput = styled(Input)`
  display: block;
  width: 100%;
  line-height: 32px;
  text-align: center;
`;

type Props = {
  patps: string[];
  selectedPatp: string;
  dropletIp: string;
  errorMessage?: string;
  successMessage?: string;
  setSelectedPatp: (patp: string) => void;
  onClickSave: (domain: string) => Promise<void>;
  onClickSidebarSection: (section: SidebarSection) => void;
  onExit: () => void;
};

export const AccountCustomDomainDialog = ({
  patps,
  selectedPatp,
  dropletIp,
  errorMessage,
  successMessage,
  setSelectedPatp,
  onClickSave,
  onClickSidebarSection,
  onExit,
}: Props) => {
  const disabled = useToggle(true);
  const submitting = useToggle(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const onChangeInput = (event: FormEvent<HTMLInputElement>) => {
    const parts = event.currentTarget.value.split('.');
    const isValidDomain =
      parts.length > 1 && parts[0].length > 0 && parts[1].length > 0;
    disabled.setToggle(!isValidDomain);
  };

  const handleSubmit = async () => {
    if (!emailInputRef.current) return;

    submitting.toggleOn();

    await onClickSave(emailInputRef.current.value);

    submitting.toggleOff();
  };

  return (
    <AccountDialog
      patps={patps}
      selectedPatp={selectedPatp}
      setSelectedPatp={setSelectedPatp}
      currentSection={SidebarSection.CustomDomain}
      onClickSidebarSection={onClickSidebarSection}
      onSubmit={handleSubmit}
      onExit={onExit}
    >
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
          ref={emailInputRef}
          onChange={onChangeInput}
        />
        <SubmitButton
          text="Save"
          submitting={submitting.isOn}
          disabled={disabled.isOn}
        />
      </Flex>
      {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
      {successMessage && <SuccessBox>{successMessage}</SuccessBox>}
    </AccountDialog>
  );
};

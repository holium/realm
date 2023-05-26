import styled from 'styled-components';

import { Button, Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';

const GetHostingButton = styled(Button.TextButton)`
  width: 192px;
  padding: 6px;
  font-size: 16px;
  font-weight: 500;
  line-height: 19px;
  border-radius: 4px;
  justify-content: center;
`;

const AddExistingServerButton = styled(GetHostingButton)`
  font-weight: 400;
  color: rgba(var(--rlm-text-rgba), 0.5);
  background-color: rgba(182, 182, 182, 0.12);

  &:hover:not([disabled]) {
    background-color: rgba(184, 184, 184, 0.15);
  }
  &:active:not([disabled]) {
    background-color: rgba(184, 184, 184, 0.2);
  }
`;

type Props = {
  onGetHosting: () => void;
  onAddExistingServer: () => void;
};

export const HostingDialogBody = ({
  onGetHosting,
  onAddExistingServer,
}: Props) => (
  <Flex flexDirection="column" gap={16}>
    <OnboardDialogTitle>Hosting</OnboardDialogTitle>
    <OnboardDialogDescription maxWidth={417}>
      Signup for Realm hosting or add your existing identity.
    </OnboardDialogDescription>
    <Flex mt={12} gap={10}>
      <GetHostingButton type="button" onClick={onGetHosting}>
        Get hosting
      </GetHostingButton>
      <AddExistingServerButton type="button" onClick={onAddExistingServer}>
        Add existing identity
      </AddExistingServerButton>
    </Flex>
  </Flex>
);

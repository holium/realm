import { Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogSubTitle,
} from '../../components/OnboardDialog.styles';

type Props = {
  patp: string | undefined;
  email: string;
};

export const AccountInformation = ({ patp, email }: Props) => (
  <>
    <Flex gap={32} mb="4px">
      {patp && (
        <Flex flexDirection="column" gap={6}>
          <OnboardDialogSubTitle>ID</OnboardDialogSubTitle>
          <OnboardDialogDescription>{patp}</OnboardDialogDescription>
        </Flex>
      )}
      <Flex flexDirection="column" gap={6}>
        <OnboardDialogSubTitle>Contact email</OnboardDialogSubTitle>
        <OnboardDialogDescription>{email}</OnboardDialogDescription>
      </Flex>
    </Flex>
  </>
);

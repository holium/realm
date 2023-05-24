import { Flex } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogSubTitle,
} from '../OnboardDialog.styles';

type Props = {
  patp: string;
  email: string;
};

export const AccountInformation = ({ patp, email }: Props) => (
  <>
    <Flex gap={32} mb="4px">
      <Flex flexDirection="column" gap={6}>
        <OnboardDialogSubTitle>Identity</OnboardDialogSubTitle>
        <OnboardDialogDescription>{patp}</OnboardDialogDescription>
      </Flex>
      <Flex flexDirection="column" gap={6}>
        <OnboardDialogSubTitle>Contact email</OnboardDialogSubTitle>
        <OnboardDialogDescription>{email}</OnboardDialogDescription>
      </Flex>
    </Flex>
  </>
);

import { Flex } from '@holium/design-system';
import {
  OnboardDialogSubTitle,
  OnboardDialogDescription,
} from '../OnboardDialog.styles';

type Props = {
  patp: string;
  email: string;
};

export const AccountInformation = ({ patp, email }: Props) => (
  <>
    <Flex gap={32} mb="4px">
      <Flex flexDirection="column" gap={6}>
        <OnboardDialogSubTitle>Urbit ID</OnboardDialogSubTitle>
        <OnboardDialogDescription>{patp}</OnboardDialogDescription>
      </Flex>
      <Flex flexDirection="column" gap={6}>
        <OnboardDialogSubTitle>Contact email</OnboardDialogSubTitle>
        <OnboardDialogDescription>{email}</OnboardDialogDescription>
      </Flex>
    </Flex>
  </>
);

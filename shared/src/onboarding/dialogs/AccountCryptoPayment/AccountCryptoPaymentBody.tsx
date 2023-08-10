import styled from 'styled-components';

import { CopyButton, Flex, Icon } from '@holium/design-system/general';

import {
  OnboardDialogDescriptionSmall,
  OnboardDialogInputLabelSmall,
} from '../../components/OnboardDialog.styles';
import { PayWithEthButton } from '../../components/PayWithEthButton';
import { GrayBox } from '../GetRealm/GetRealmDialogBody.styles';

const GrayBoxCrypto = styled(GrayBox)`
  flex-direction: column;
  padding: 8px;
  gap: 8px;
`;

type Props = {
  serviceStartDate: string;
  ethAddress: string;
  balance: string;
  due: string;
  paymentHistory: string[];
  onClickPay: () => void;
};

export const AccountCryptoPaymentBody = ({
  serviceStartDate,
  ethAddress,
  balance,
  due,
  onClickPay,
}: Props) => (
  <>
    <Flex flexDirection="column">
      <OnboardDialogInputLabelSmall>
        Service Start Date
      </OnboardDialogInputLabelSmall>
      <GrayBoxCrypto>
        <OnboardDialogDescriptionSmall>
          {serviceStartDate}
        </OnboardDialogDescriptionSmall>
      </GrayBoxCrypto>
    </Flex>
    <Flex flexDirection="column">
      <OnboardDialogInputLabelSmall>
        Deposit Address
      </OnboardDialogInputLabelSmall>
      <GrayBoxCrypto>
        <Flex justifyContent="space-between">
          <OnboardDialogDescriptionSmall>
            {ethAddress}
          </OnboardDialogDescriptionSmall>
          <CopyButton content={ethAddress} />
        </Flex>
        <Flex gap="10px">
          <OnboardDialogDescriptionSmall>Balance</OnboardDialogDescriptionSmall>
          <OnboardDialogDescriptionSmall fontWeight={500}>
            {balance}
          </OnboardDialogDescriptionSmall>
        </Flex>
        <Flex gap="10px">
          <OnboardDialogDescriptionSmall>Due</OnboardDialogDescriptionSmall>
          <OnboardDialogDescriptionSmall fontWeight={500}>
            {due}
          </OnboardDialogDescriptionSmall>
        </Flex>
      </GrayBoxCrypto>
      <Flex width="100%" mt="16px">
        <PayWithEthButton onClick={onClickPay} />
      </Flex>
    </Flex>
    <Flex gap="2px" alignItems="center">
      <Icon name="History" size={16} />
      <OnboardDialogInputLabelSmall style={{ margin: 0 }}>
        Payment History
      </OnboardDialogInputLabelSmall>
    </Flex>
    <Flex flexDirection="column" alignItems="center">
      <OnboardDialogDescriptionSmall>
        No payment history
      </OnboardDialogDescriptionSmall>
    </Flex>
  </>
);

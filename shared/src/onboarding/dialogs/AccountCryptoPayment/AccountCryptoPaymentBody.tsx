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

export type CryptoPayment = {
  date: string;
  from: string;
  ethAmount: string;
  usdAmount: string;
};

type Props = {
  serviceStartDate: string;
  ethAddress: string;
  balance: string;
  due: string;
  paymentHistory: CryptoPayment[];
  onClickPay: () => void;
};

export const AccountCryptoPaymentBody = ({
  serviceStartDate,
  ethAddress,
  balance,
  due,
  paymentHistory,
  onClickPay,
}: Props) => (
  <Flex flexDirection="column" gap="16px" minHeight={0} overflowY="auto">
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
          <OnboardDialogDescriptionSmall width="100px">
            Balance
          </OnboardDialogDescriptionSmall>
          <OnboardDialogDescriptionSmall fontWeight={500}>
            {balance}
          </OnboardDialogDescriptionSmall>
        </Flex>
        <Flex gap="10px">
          <OnboardDialogDescriptionSmall width="100px">
            Due
          </OnboardDialogDescriptionSmall>
          <OnboardDialogDescriptionSmall fontWeight={500}>
            {due}
          </OnboardDialogDescriptionSmall>
        </Flex>
      </GrayBoxCrypto>
      <Flex width="100%" mt="16px">
        <PayWithEthButton onClick={onClickPay} />
      </Flex>
    </Flex>
    <Flex flexDirection="column" gap="4px">
      <Flex gap="4px" alignItems="center">
        <Icon name="History" size={16} />
        <OnboardDialogInputLabelSmall style={{ margin: 0 }}>
          Payment History
        </OnboardDialogInputLabelSmall>
      </Flex>
      <Flex flexDirection="column" gap="8px" overflowY="auto" minHeight={0}>
        {paymentHistory.length > 0 ? (
          paymentHistory.map((payment, index) => (
            <GrayBoxCrypto key={index}>
              <Flex gap="10px">
                <OnboardDialogDescriptionSmall width="100px">
                  Date
                </OnboardDialogDescriptionSmall>
                <OnboardDialogDescriptionSmall fontWeight={500}>
                  {payment.date}
                </OnboardDialogDescriptionSmall>
              </Flex>
              <Flex gap="10px">
                <OnboardDialogDescriptionSmall width="100px">
                  From
                </OnboardDialogDescriptionSmall>
                <OnboardDialogDescriptionSmall fontWeight={500}>
                  {payment.from}
                </OnboardDialogDescriptionSmall>
              </Flex>
              <Flex gap="10px">
                <OnboardDialogDescriptionSmall width="100px">
                  Amount
                </OnboardDialogDescriptionSmall>
                <OnboardDialogDescriptionSmall fontWeight={500}>
                  {payment.ethAmount}
                </OnboardDialogDescriptionSmall>
              </Flex>
            </GrayBoxCrypto>
          ))
        ) : (
          <OnboardDialogDescriptionSmall
            width="100%"
            textAlign="center"
            pt="16px"
          >
            No payment history
          </OnboardDialogDescriptionSmall>
        )}
      </Flex>
    </Flex>
  </Flex>
);

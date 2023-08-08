import { CopyButton, Flex, Icon, Text } from '@holium/design-system/general';

import {
  OnboardDialogDescription,
  OnboardDialogInputLabelSmall,
} from '../../components/OnboardDialog.styles';
import { PayButton } from '../FundAccount/FundAccountDialogBody';
import { GrayBox } from '../GetRealm/GetRealmDialogBody.styles';

type Props = {
  onClickPay: () => void;
};

export const AccountCryptoPaymentBody = ({ onClickPay }: Props) => {
  const ethAddress = '0xAC36fc83EB0B09ACd3244AD6637A8e8404724D6c';

  return (
    <>
      <Flex flexDirection="column">
        <OnboardDialogInputLabelSmall>
          Service Start Date
        </OnboardDialogInputLabelSmall>
        <GrayBox>07/18/23 06:56 AM UTC</GrayBox>
      </Flex>
      <Flex flexDirection="column">
        <OnboardDialogInputLabelSmall>
          Deposit Address
        </OnboardDialogInputLabelSmall>
        <GrayBox flexDirection="column">
          <Flex justifyContent="space-between">
            <Text.Body>{ethAddress}</Text.Body>
            <CopyButton content={ethAddress} />
          </Flex>
          <Flex justifyContent="space-between">
            <Text.Body>Balance</Text.Body>
            <Text.Body>0.00 ETH</Text.Body>
          </Flex>
          <Flex justifyContent="space-between">
            <Text.Body>Due</Text.Body>
            <Text.Body>0.0080 ETH by 08/16/23 </Text.Body>
          </Flex>
        </GrayBox>
      </Flex>
      <Flex gap="2px" alignItems="center">
        <Icon name="History" size={16} />
        <OnboardDialogInputLabelSmall style={{ margin: 0 }}>
          Payment History
        </OnboardDialogInputLabelSmall>
      </Flex>
      <Flex flexDirection="column" alignItems="center">
        <OnboardDialogDescription>No payment history</OnboardDialogDescription>
      </Flex>
      <Flex width="100%">
        <PayButton>
          <Text.Body style={{ color: '#ffffff' }} onClick={onClickPay}>
            Pay
          </Text.Body>
        </PayButton>
      </Flex>
    </>
  );
};

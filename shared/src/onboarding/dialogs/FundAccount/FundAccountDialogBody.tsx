import { useState } from 'react';
import styled from 'styled-components';

import { Button, CopyButton, Flex, Text } from '@holium/design-system/general';

import { FundingCard } from '../../components/FundingCard';
import {
  OnboardDialogDescriptionTiny,
  OnboardDialogInputLabel,
  OnboardDialogTitleBig,
} from '../../components/OnboardDialog.styles';
import { FormField } from '../../onboarding';

const PayButton = styled(Button.Primary)`
  flex: 1;
  height: 36px;
  justify-content: center;
  gap: 12px;
  border-radius: 6px;
  background: #43c35f;
`;

const SkipButton = styled(Button.Secondary)`
  flex: 1;
  height: 36px;
  justify-content: center;
  border-radius: 6px;
`;

type Props = {
  ethAddress: string;
  onNext: () => Promise<boolean>;
};

export type FundAccountDialogFields = {
  fundingOption: number;
};

export const FundAccountDialogBody = ({ ethAddress, onNext }: Props) => {
  // const { errors } = useFormikContext<Fields>();

  const [fundingOption, setFundingOption] = useState(0);

  return (
    <>
      <Flex mb="16px">
        <OnboardDialogTitleBig>Fund your account</OnboardDialogTitleBig>
      </Flex>
      <Flex flexDirection="column" gap={4} mb="16px">
        <OnboardDialogInputLabel as="label" htmlFor="eth-address">
          Deposit Address
        </OnboardDialogInputLabel>
        <FormField
          name="eth-address"
          type="text"
          disabled
          value={ethAddress}
          placeholder="0xAC36fc83EB0B09ACd3244AD6637A8e8404724D6c"
          rightIcon={<CopyButton content={ethAddress} />}
        />
        <OnboardDialogDescriptionTiny>
          This is your unique deposit address for easy hosting payments. We'll
          alert you seven days before funds run low. Recharge your address to
          maintain uninterrupted service.
        </OnboardDialogDescriptionTiny>
      </Flex>
      <Flex flexDirection="column" gap={4} mb="8px">
        <OnboardDialogInputLabel as="label" htmlFor="eth-address">
          Funding options
        </OnboardDialogInputLabel>
        <FundingCard
          label="One month"
          ethPrice="0.0080 ETH"
          usdPrice="$15.00 USD"
          isSelected={fundingOption === 0}
          onClick={() => setFundingOption(0)}
        />
        <FundingCard
          label="One year"
          ethPrice="0.080 ETH"
          usdPrice="$150.00 USD"
          isSelected={fundingOption === 1}
          onClick={() => setFundingOption(1)}
        />
        <FundingCard
          label="Lifetime"
          ethPrice="2.125 ETH"
          usdPrice="$4,000.00 USD"
          isSelected={fundingOption === 2}
          onClick={() => setFundingOption(2)}
        />
      </Flex>
      <Flex>
        <SkipButton onClick={onNext}>
          <Text.Body
            style={{
              fontSize: '16px',
              fontWeight: 500,
              color: '#898989',
            }}
          >
            Skip for now
          </Text.Body>
        </SkipButton>
        <PayButton onClick={onNext}>
          <Text.Body
            style={{
              fontSize: '18px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255)',
            }}
          >
            Pay
          </Text.Body>
          <Text.Body
            style={{
              fontSize: '18px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.70)',
            }}
          >
            0.0080 ETH
          </Text.Body>
        </PayButton>
      </Flex>
    </>
  );
};

import { useState } from 'react';
import styled from 'styled-components';

import { Button, CopyButton, Flex, Text } from '@holium/design-system/general';

import {
  FUNDING_OPTIONS,
  FundingOption,
  FundingOptions,
} from '../../components/FundingOptions';
import {
  OnboardDialogDescriptionTiny,
  OnboardDialogInputLabelSmall,
  OnboardDialogTitleBig,
} from '../../components/OnboardDialog.styles';
import { PayWithEthButton } from '../../components/PayWithEthButton';
import { FormField } from '../../onboarding';

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

  const [fundingOption, setFundingOption] = useState<FundingOption>(
    FUNDING_OPTIONS[0]
  );

  return (
    <>
      <Flex mb="16px">
        <OnboardDialogTitleBig>Fund your account</OnboardDialogTitleBig>
      </Flex>
      <Flex flexDirection="column" gap={4} mb="16px">
        <OnboardDialogInputLabelSmall as="label" htmlFor="eth-address">
          Deposit Address
        </OnboardDialogInputLabelSmall>
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
      <FundingOptions
        fundingOption={fundingOption}
        setFundingOption={setFundingOption}
      />
      <Flex gap="8px">
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
        <PayWithEthButton ethPrice={fundingOption.ethPrice} onClick={onNext} />
      </Flex>
    </>
  );
};

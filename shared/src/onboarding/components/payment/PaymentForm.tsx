import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
} from '@stripe/react-stripe-js';
import { Flex } from '@holium/design-system';
import { OnboardDialogSubTitle } from '../OnboardDialog.styles';
import styled, { css } from 'styled-components';

const InputCss = css`
  background-color: white;
  border: 1px solid rgba(var(--rlm-border-rgba));
  border-radius: 6px;
  padding: 10px 12px;
  font-size: '15px';
  padding: '10px 12px';
`;

const CardNumberInput = styled(CardNumberElement)`
  ${InputCss}
`;

const CardExpiryInput = styled(CardExpiryElement)`
  ${InputCss}
`;

const CardCvcInput = styled(CardCvcElement)`
  ${InputCss}
`;

const options = {
  style: {
    base: {
      '::placeholder': {
        color: 'rgba(165, 172, 184, 1)',
        fontWeight: 600,
      },
    },
  },
};

export const PaymentForm = () => (
  <Flex flexDirection="column" gap="16px">
    <OnboardDialogSubTitle as="label" width="100%">
      <Flex flexDirection="column" gap="4px">
        Card number
        <CardNumberInput options={options} />
      </Flex>
    </OnboardDialogSubTitle>
    <Flex gap="10px">
      <Flex flex="1">
        <OnboardDialogSubTitle as="label" width="100%">
          <Flex flexDirection="column" gap="4px">
            Expiration date
            <CardExpiryInput options={options} />
          </Flex>
        </OnboardDialogSubTitle>
      </Flex>
      <Flex flex="1">
        <OnboardDialogSubTitle as="label" width="100%">
          <Flex flexDirection="column" gap="4px">
            CVC
            <CardCvcInput options={options} />
          </Flex>
        </OnboardDialogSubTitle>
      </Flex>
    </Flex>
  </Flex>
);

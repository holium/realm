import styled from 'styled-components';

import { Button, Text } from '@holium/design-system/general';

const PayButton = styled(Button.Primary)`
  flex: 1;
  height: 36px;
  justify-content: center;
  gap: 12px;
  border-radius: 6px;
  background: #43c35f;

  && {
    &:hover {
      background: #43c35f !important;
    }
  }
`;

type Props = {
  ethPrice?: string;
  onClick: () => void;
};

export const PayWithEthButton = ({ ethPrice, onClick }: Props) => (
  <PayButton width="100%" onClick={onClick}>
    <Text.Body
      style={{
        fontSize: '18px',
        fontWeight: 500,
        color: 'rgba(255, 255, 255)',
      }}
    >
      Pay
    </Text.Body>
    {ethPrice && (
      <Text.Body
        style={{
          fontSize: '18px',
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.70)',
        }}
      >
        {ethPrice}
      </Text.Body>
    )}
  </PayButton>
);

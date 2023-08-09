import styled from 'styled-components';

import { Flex, Icon, Text } from '@holium/design-system/general';

import { GrayBox } from '../dialogs/GetRealm/GetRealmDialogBody.styles';

export const FundText = styled(Text.Body)`
  color: rgba(51, 51, 51, 0.5);
  font-family: Rubik;
  font-size: 12px;
  line-height: 16px;
`;

type Props = {
  amount: string;
  due: string;
};

export const FundWithBy = ({ amount, due }: Props) => {
  return (
    <GrayBox
      style={{
        gap: '8px',
        padding: '8px',
      }}
    >
      <Icon name="CoinsCrypto" size={24} />
      <Flex flexDirection="column">
        <FundText>
          Fund with <span style={{ fontWeight: 500 }}>{amount}</span>
        </FundText>
        <FundText>
          by <span style={{ fontWeight: 500 }}>{due}</span>
        </FundText>
      </Flex>
    </GrayBox>
  );
};

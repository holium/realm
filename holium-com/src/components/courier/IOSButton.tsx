import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';

import { AppleSvg } from './AppleSvg';

const ButtonContainer = styled.button`
  display: flex;
  padding: 10px 12px;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 9px;
  background: #000000;
  cursor: pointer;
`;

const ButtonLabel = styled(Text.Body)`
  color: #fff;
  font-family: Rubik;
  font-size: 20px;
  font-weight: 500;
`;

const ButtonSubLabel = styled(Text.Body)`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 12px;
`;

type Props = {
  label: string;
  subLabel: string;
};

export const IOSButton = ({ label, subLabel }: Props) => {
  return (
    <ButtonContainer>
      <AppleSvg />
      <Flex flexDirection="column" alignItems="flex-start">
        <ButtonSubLabel>{subLabel}</ButtonSubLabel>
        <ButtonLabel>{label}</ButtonLabel>
      </Flex>
    </ButtonContainer>
  );
};

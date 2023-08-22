import styled from 'styled-components';

import { Button, Icon, Text } from '@holium/design-system/general';

const ButtonContainer = styled(Button.Secondary)`
  display: flex;
  width: 230px;
  padding: 10px 10px 10px 16px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 9px;
  background: #efefef;
`;

const ButtonLabel = styled(Text.Body)`
  color: rgba(51, 51, 51, 0.6);
  font-size: 20px;
`;

export const CourierWebButton = () => {
  return (
    <ButtonContainer>
      <ButtonLabel>Open Courier Web</ButtonLabel>
      <Icon name="ChevronRight" size="30px" fill="text" opacity={0.5} />
    </ButtonContainer>
  );
};

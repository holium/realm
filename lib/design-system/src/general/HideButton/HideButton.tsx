import styled from 'styled-components';

import { Flex } from '../Flex/Flex';
import { Icon } from '../Icon/Icon';
import { Text } from '../Text/Text';

const HideLabel = styled(Text.Body)`
  font-size: 14px;
  font-weight: 400;
  color: rgba(var(--rlm-text-rgba));
  opacity: 0.5;
  user-select: none;
`;

type Props = {
  isOn: boolean;
  onClick: () => void;
};

export const HideButton = ({ isOn, onClick }: Props) => (
  <Flex
    gap={4}
    alignItems="center"
    style={{ cursor: 'pointer' }}
    onClick={onClick}
  >
    <Icon
      name={isOn ? 'EyeOn' : 'EyeOff'}
      size={20}
      fill="text"
      opacity={0.5}
    />
    <HideLabel>{isOn ? 'Show' : 'Hide'}</HideLabel>
  </Flex>
);

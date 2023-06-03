import styled from 'styled-components';

import {
  Button,
  Flex,
  Icon,
  IconPathsType,
  Text,
} from '@holium/design-system/general';

const FullButton = styled(Button.Transparent)`
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: var(--transition);

  svg {
    fill: #ffffff !important;
  }
`;

const CircleBtn = styled(Flex)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--rlm-accent-color);
`;

type Props = {
  icon: IconPathsType;
  title: string;
  onClick: () => void;
};

export const CircleButton = ({ icon, title, onClick }: Props) => (
  <FullButton onClick={onClick}>
    <CircleBtn>
      <Icon name={icon} size={24} fill="window" />
    </CircleBtn>
    <Text.Body style={{ fontWeight: 300, color: 'var(--rlm-accent-color)' }}>
      {title}
    </Text.Body>
  </FullButton>
);

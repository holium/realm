import styled from 'styled-components';

import {
  Button,
  Flex,
  Icon,
  IconPathsType,
  Text,
} from '@holium/design-system/general';

const CircleBtn = styled(Flex)`
  flex-direction: column;
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--rlm-accent-color);
`;

const FullButton = styled(Button.Transparent)`
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    ${CircleBtn} {
      background-color: var(--rlm-accent-color);
    }
    ${Text} {
      color: var(--rlm-accent-color);
    }
  }

  svg {
    fill: var(--rlm-window-color);
  }
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
    <Text.Body color="accent" style={{ fontWeight: 300 }}>
      {title}
    </Text.Body>
  </FullButton>
);

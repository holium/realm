import { FC } from 'react';
import styled from 'styled-components';

import { Flex, FlexProps, Icon } from '@holium/design-system/general';

const CommCircle = styled(Flex)<FlexProps>`
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  background: var(--rlm-window-color);
  transition: var(--transition-slow);
  background-image: linear-gradient(rgb(0 0 0/10%) 0 0);

  &:hover {
    transition: var(--transition-slow);
    background: var(--rlm-window-color);
    background-image: linear-gradient(rgb(0 0 0/20%) 0 0);
  }
`;

interface CommButtonProps {
  minimal?: boolean;
  icon: any;
  onClick: (evt: any) => void;
}

export const CommButton: FC<CommButtonProps> = (props: CommButtonProps) => {
  return (
    <CommCircle
      style={{ pointerEvents: 'none' }}
      onClick={(evt: any) => props.onClick(evt)}
    >
      <Icon size={24} name={props.icon} />
    </CommCircle>
  );
};

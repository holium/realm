import { FC } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import { Flex, Icons, IconTypes } from 'renderer/components';
import { ThemeType } from 'renderer/theme';

interface CommCircleProps {
  customBg: string;
  theme: ThemeType;
}

const CommCircle = styled(Flex)<CommCircleProps>`
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${(props: CommCircleProps) => props.customBg};
  transition: ${(props: CommCircleProps) => props.theme.transition};
  &:hover {
    background: ${(props: CommCircleProps) => darken(0.025, props.customBg)};
    transition: ${(props: CommCircleProps) => props.theme.transition};
  }
`;

interface CommButtonProps {
  minimal?: boolean;
  customBg: string;
  icon: IconTypes;
  onClick: (evt: any) => void;
}

export const CommButton: FC<CommButtonProps> = (props: CommButtonProps) => {
  return (
    <CommCircle
      customBg={props.customBg}
      onClick={(evt: any) => props.onClick(evt)}
    >
      <Icons size={24} name={props.icon} />
    </CommCircle>
  );
};

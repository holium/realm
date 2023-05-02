import { MouseEventHandler } from 'react';
import styled from 'styled-components';

import {
  Button,
  ColorVariants,
  Icon,
  IconPathsType,
} from '@holium/design-system';

type WindowButtonProps = {
  bgColor?: string;
};

const WindowButton = styled(Button.IconButton)<WindowButtonProps>`
  position: relative;
  width: 24px;
  height: 24px;
  transition: var(--transition);
  &:hover:not([disabled]) {
    ${({ bgColor }) =>
      bgColor && `background-color rgba(var(--rlm-${bgColor}-rgba), 0.12)`};
    svg {
      ${({ bgColor }) => bgColor && `fill: rgba(var(--rlm-${bgColor}-rgba))`};
    }
    transition: var(--transition);
  }
`;

interface WindowIconProps {
  icon: IconPathsType;
  iconColor?: ColorVariants;
  disabled?: boolean;
  size?: number;
  fillWithBg?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export const AppWindowIcon = ({
  icon,
  iconColor,
  onClick,
}: WindowIconProps) => (
  <WindowButton
    position="relative"
    className="realm-cursor-hover"
    bgColor={iconColor}
    onPointerDown={(evt: any) => {
      evt.stopPropagation();
    }}
    onDrag={(evt: any) => {
      evt.stopPropagation();
    }}
    onClick={onClick}
  >
    <Icon name={icon} size={20} />
  </WindowButton>
);

import { MouseEventHandler } from 'react';
import styled, { css } from 'styled-components';
import { Flex, Row, Text, Icon, TextProps } from '../../';
import { IconPathsType } from '../../general/Icon/icons';

export type MenuItemProps = {
  id?: string;
  icon?: IconPathsType;
  iconColor?: string;
  label: string;
  labelColor?: string;
  disabled?: boolean;
  section?: number;
  onClick: MouseEventHandler<HTMLElement>;
};

type MenuItemLabelProps = {
  labelColor?: string;
} & TextProps;

const MenuItemLabel = styled(Text.Custom)<MenuItemLabelProps>`
  ${(props) =>
    props.labelColor &&
    css`
      color: ${props.labelColor || 'inherit'};
    `}
`;

export const MenuItem = ({
  id,
  icon,
  label,
  disabled,
  iconColor,
  labelColor,
  onClick,
}: MenuItemProps) => {
  return (
    <Row
      id={id}
      key={id}
      height={34}
      disabled={disabled}
      className="nav-menu-item"
      onClick={(evt) => !disabled && onClick(evt)}
    >
      <Flex
        pointerEvents={disabled ? 'none' : 'all'}
        flexDirection="row"
        gap={10}
        alignItems="center"
      >
        {icon && (
          <Icon
            iconColor={iconColor}
            name={icon}
            size={16}
            opacity={iconColor ? 1 : 0.5}
          />
        )}
        <MenuItemLabel labelColor={labelColor} fontSize={2}>
          {label}
        </MenuItemLabel>
      </Flex>
    </Row>
  );
};

import { MouseEventHandler } from 'react';
import styled, { css } from 'styled-components';
import { Flex, Row, Text, Icon } from '../../';
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

const MenuItemLabel = styled(Text.Custom)<{ labelColor?: string }>`
  ${(props) =>
    props.labelColor &&
    css`
      color: ${props.labelColor};
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
    <Row height={34} id={id} disabled={disabled} onClick={onClick}>
      <Flex flexDirection="row" gap={10} alignItems="center">
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

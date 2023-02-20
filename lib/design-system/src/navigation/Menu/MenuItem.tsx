import { MouseEventHandler } from 'react';
import { Flex, Row, Text, Icon } from '../../';
import { IconPathsType } from '../../general/Icon/icons';

export type MenuItemProps = {
  id?: string;
  icon?: IconPathsType;
  label: string;
  disabled?: boolean;
  section?: number;
  onClick: MouseEventHandler<HTMLElement>;
};

export const MenuItem = ({
  id,
  icon,
  label,
  disabled,
  onClick,
}: MenuItemProps) => {
  return (
    <Row height={34} id={id} disabled={disabled} onClick={onClick}>
      <Flex flexDirection="row" gap={10} alignItems="center">
        {icon && <Icon name={icon} size={16} opacity={0.5} />}
        <Text.Custom fontSize={2}>{label}</Text.Custom>
      </Flex>
    </Row>
  );
};

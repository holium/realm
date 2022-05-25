import { FC } from 'react';
import { SpaceProps } from 'styled-system';
import { Box, Text } from '../';
import { ChildrenBox, MenuItemStyle } from './MenuItem.styles';

export type IntentProps = {
  intent?: 'primary' | 'alert' | 'caution' | 'success' | 'info';
};

export type MenuItemProps = {
  icon?: any;
  style?: any;
  tabIndex?: number;
  label: string;
  disabled?: boolean;
  selected?: boolean;
  children?: any;
  section?: number;
  type?: 'neutral' | 'brand';
  color?: string;
  customBg?: string;
  onClick: (...args: any) => void;
  subMenu?: any[];
} & IntentProps &
  SpaceProps;

export const MenuItem: FC<MenuItemProps> = (props: Partial<MenuItemProps>) => {
  const {
    icon,
    label,
    style,
    intent,
    disabled,
    onClick,
    selected,
    // subMenu
    type,
    customBg,
    color,
    children,
    tabIndex,
  } = props;

  return (
    <MenuItemStyle
      tabIndex={tabIndex}
      style={style}
      flex={1}
      highlightType={type}
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-start"
      intent={intent}
      color={color}
      data-prevent-context-close={disabled}
      disabled={disabled}
      selected={selected}
      customBg={customBg}
      onKeyPress={(evt: any) => {
        const key = evt.keyCode || evt.which;
        if (key === 13) {
          evt.preventDefault(); // Ensure it is only this code that runs
          // @ts-expect-error i hate typescript
          onClick(evt);
        }
      }}
      onClick={(evt: any) => {
        if (!disabled) {
          // @ts-expect-error i hate typescript
          onClick(evt);
        } else {
          evt.preventDefault();
          evt.stopPropagation();
        }
      }}
      value={label}
      {...props}
    >
      {icon && (
        <Box color="inherit" mr={2}>
          {icon}
        </Box>
      )}
      <Text fontSize={2} fontWeight={500}>
        {label}
      </Text>
      {children && <ChildrenBox interaction={disabled}>{children}</ChildrenBox>}
    </MenuItemStyle>
  );
};

MenuItem.defaultProps = {
  type: 'neutral',
};

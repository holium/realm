import { MouseEventHandler } from 'react';
import { Box, Spinner, Text } from '../';
import { MenuItemStyle } from './MenuItem.styles';

export type MenuItemProps = {
  id?: string;
  icon?: any;
  style?: any;
  loading?: boolean;
  tabIndex?: number;
  label: string;
  disabled?: boolean;
  selected?: boolean;
  section?: number;
  color?: string;
  customBg?: string;
  onClick: MouseEventHandler<HTMLLIElement>;
};

export const MenuItem = ({
  id,
  icon,
  label,
  style,
  disabled,
  onClick,
  selected,
  customBg,
  color,
  tabIndex,
  loading = false,
}: MenuItemProps) => {
  let innerContent;
  if (loading) {
    innerContent = <Spinner size={1} />;
  } else {
    innerContent = (
      <>
        {icon && (
          <Box color="inherit" mr={2}>
            {icon}
          </Box>
        )}
        <Text style={{ pointerEvents: 'none' }} fontSize={2} fontWeight={400}>
          {label}
        </Text>
      </>
    );
  }

  return (
    <MenuItemStyle
      id={id}
      key={id}
      tabIndex={tabIndex}
      style={style}
      className="realm-cursor-hover"
      color={color}
      customBg={customBg}
      data-prevent-context-close={disabled}
      disabled={disabled}
      selected={selected}
      onClick={(evt) => {
        if (!disabled) {
          onClick(evt);
        } else {
          evt.preventDefault();
          evt.stopPropagation();
        }
      }}
    >
      {innerContent}
    </MenuItemStyle>
  );
};

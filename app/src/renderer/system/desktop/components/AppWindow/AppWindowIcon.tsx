import { MouseEventHandler } from 'react';
import { rgba } from 'polished';
import { IconButton, IconPathsType, Icons } from 'renderer/components';

interface WindowIconProps {
  icon: IconPathsType;
  bg: string;
  iconColor: string;
  disabled?: boolean;
  size?: number;
  fillWithBg?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export const AppWindowIcon = ({
  size = 24,
  disabled,
  icon,
  bg,
  iconColor,
  fillWithBg,
  onClick,
}: WindowIconProps) => (
  <IconButton
    isDisabled={disabled}
    className="realm-cursor-hover"
    size={size}
    initial={{ background: rgba(bg, 0) }}
    whileHover={{ background: rgba(bg, 0.2), fill: bg }}
    transition={{ background: 0.2, fill: 0.2 }}
    hoverFill={fillWithBg ? bg : iconColor}
    onPointerDown={(evt: any) => {
      evt.stopPropagation();
    }}
    onDrag={(evt: any) => {
      evt.stopPropagation();
    }}
    onClick={onClick}
    color={rgba(iconColor, 0.4)}
  >
    <Icons name={icon} color={iconColor} />
  </IconButton>
);

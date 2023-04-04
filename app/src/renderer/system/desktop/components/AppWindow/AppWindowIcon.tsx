import { rgba } from 'polished';
import { MouseEventHandler } from 'react';
import { Button, Icon, IconPathsType } from '@holium/design-system';

interface WindowIconProps {
  icon: IconPathsType;
  bg: string;
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
  fillWithBg,
  onClick,
}: WindowIconProps) => (
  <Button.IconButton
    className="realm-cursor-hover"
    size={size}
    // initial={{ background: rgba(bg, 0) }}
    // whileHover={{ background: rgba(bg, 0.2), fill: bg }}
    // transition={{ background: 0.2, fill: 0.2 }}
    // hoverFill={fillWithBg ? bg : iconColor}
    // onPointerDown={(evt: any) => {
    //   evt.stopPropagation();
    // }}
    onDrag={(evt: any) => {
      evt.stopPropagation();
    }}
    onClick={onClick}
  >
    <Icon name={icon} size={22} />
  </Button.IconButton>
);

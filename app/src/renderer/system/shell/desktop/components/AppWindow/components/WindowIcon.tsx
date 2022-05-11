import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { FC } from 'react';
import { rgba, lighten, darken } from 'polished';

import { IconButton, Icons, IconTypes } from '../../../../../../components';

interface WindowIconProps {
  icon: IconTypes;
  bg: string;
  iconColor: string;
  onClick: (...params: any) => void;
  fillWithBg?: boolean;
}

export const WindowIcon: FC<WindowIconProps> = (props: WindowIconProps) => {
  const { icon, bg, iconColor, onClick, fillWithBg } = props;
  return (
    <IconButton
      initial={{ background: rgba(bg, 0) }}
      whileHover={{ background: rgba(bg, 0.2), fill: bg }}
      transition={{ background: 0.2, fill: 0.2 }}
      // animate={{
      //   // background: rgba(bg, 0),
      //   transition: { background: 0.2, fill: 0.2 },
      // }}
      hoverFill={fillWithBg ? bg : iconColor}
      onPointerDown={(evt: any) => {
        evt.stopPropagation();
      }}
      onDrag={(evt: any) => {
        evt.stopPropagation();
      }}
      onClick={onClick}
    >
      <Icons name={icon} color={iconColor} />
    </IconButton>
  );
};

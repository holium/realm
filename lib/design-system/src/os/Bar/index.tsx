import { FC } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  compose,
  space,
  layout,
  flexbox,
  border,
  position,
  color,
  backgroundColor,
  SpaceProps,
  LayoutProps,
  FlexboxProps,
  BorderProps,
  PositionProps,
  BackgroundColorProps,
} from 'styled-system';

export type BarStyleProps = SpaceProps &
  LayoutProps &
  FlexboxProps &
  BorderProps &
  PositionProps &
  BackgroundColorProps & { children: React.ReactNode };

export const BarStyle = styled(styled(motion.div)<BarStyleProps>`
  position: relative;
  z-index: 3;
  height: 40px;
  width: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 6px;
  backdrop-filter: var(--blur-enabled);
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
  perspective: 1000;
  transition: var(--transition-slow);
  background: var(--rlm-dock-color);
`)<BarStyleProps>(
  {},
  compose(space, layout, flexbox, border, position, color, backgroundColor)
);

export const Bar: FC<BarStyleProps> = ({ children, ...rest }) => {
  return (
    <BarStyle animate={{ scale: 1 }} transition={{ scale: 0.5 }} {...rest}>
      {children}
    </BarStyle>
  );
};

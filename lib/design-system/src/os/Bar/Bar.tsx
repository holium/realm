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

export const BarStyle = styled(motion.div)<BarStyleProps>`
  position: relative;
  z-index: 14;
  height: 40px;
  width: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 6px;
  backdrop-filter: var(--blur);
  /* transform: translate3d(0, 0, 0); */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: var(--transition-slow);
  background: var(--rlm-dock-color);
  ${compose(space, layout, flexbox, border, position, color)}
`;

export const Bar: FC<BarStyleProps> = ({ children, ...rest }) => {
  return (
    <BarStyle animate={{ scale: 1 }} transition={{ scale: 0.5 }} {...rest}>
      {children}
    </BarStyle>
  );
};

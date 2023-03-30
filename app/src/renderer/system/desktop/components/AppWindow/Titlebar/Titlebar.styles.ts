import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Flex } from '@holium/design-system';

type Props = {
  hasBorder: boolean;
  zIndex: number;
  isAppWindow?: boolean;
  hasBlur?: boolean;
};

export const TitlebarContainer = styled(motion.div)<Props>`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  position: ${({ isAppWindow }) => (isAppWindow ? 'relative' : 'absolute')};
  /* backdrop-filter: ${(props) => (props.hasBlur ? 'blur(16px)' : 'none')}; */
  top: 0;
  left: 0;
  right: 0;
  height: ${({ isAppWindow }) => (isAppWindow ? 30 : 54)}px;
  padding: 0 4px 0 ${(props) => (props.isAppWindow ? 4 : 0)}px;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  ${({ zIndex, hasBorder }) => css`
    z-index: ${zIndex};
    border-bottom: ${hasBorder
      ? '1px solid rgba(var(--rlm-border-rgba))'
      : 'none'};
  `}
`;

export const TitleCentered = styled(Flex)`
  position: absolute;
  height: 30px;
  left: 0;
  right: 0;
  text-align: center;
`;

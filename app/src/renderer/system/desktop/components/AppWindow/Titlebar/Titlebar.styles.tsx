import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Flex } from '@holium/design-system';

type TitlebarStyleProps = {
  hasBorder: boolean;
  zIndex: number;
  isAppWindow?: boolean;
  hasBlur?: boolean;
};

export const TitlebarStyle = styled(motion.div)<TitlebarStyleProps>`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  position: ${(props: TitlebarStyleProps) =>
    props.isAppWindow ? 'relative' : 'absolute'};
  /* backdrop-filter: ${(props: TitlebarStyleProps) =>
    props.hasBlur ? 'blur(16px)' : 'none'}; */
  top: 0;
  left: 0;
  right: 0;
  height: ${(props: TitlebarStyleProps) => (props.isAppWindow ? 30 : 54)}px;
  padding: 0 4px 0
    ${(props: TitlebarStyleProps) => (props.isAppWindow ? 4 : 0)}px;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  ${(props: TitlebarStyleProps) => css`
    z-index: ${props.zIndex};
    border-bottom: ${props.hasBorder
      ? ' 1px solid var(--rlm-border-color)'
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

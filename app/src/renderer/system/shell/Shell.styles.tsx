import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Fill } from 'react-spaces';

import { ThemeType } from '../../theme';

export const BackgroundImage = styled(motion.img)`
  ${(props: { blur?: boolean; src?: string }) =>
    props.src &&
    css`
      position: fixed;
      /* right: -20px;
      left: -20px; */
      z-index: 0;
      /* top: -22px;
      bottom: -22px; */
      width: calc(100% + 40px);
      height: calc(100vh + 42px);
      opacity: 0.5;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
      background-image: url(${props.src});
      -webkit-filter: blur(${props.blur ? '20px' : '0px'});
      -moz-filter: blur(${props.blur ? '20px' : '0px'});
      -o-filter: blur(${props.blur ? '20px' : '0px'});
      -ms-filter: blur(${props.blur ? '20px' : '0px'});
      filter: blur(${props.blur ? '20px' : '0px'});
    `}
`;

type BackgroundStyleProps = { hasWallpaper: boolean; theme: ThemeType };

export const BackgroundFill = styled(Fill)`
  position: relative;
  z-index: 1;
  background: ${(props: BackgroundStyleProps) =>
    props.hasWallpaper ? 'transparent' : props.theme.colors.bg.primary};
`;

export const BackgroundDarken = styled(Fill)`
  background: ${(props: BackgroundStyleProps) =>
    props.hasWallpaper ? '#333333' : 'transparent'};
`;

import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Fill } from 'react-spaces';

import { ThemeType } from '../theme';

export const DimensionMeasurement = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100vh;
  width: 100%;
`;

export const BackgroundWrap = styled(motion.div)`
  user-select: none;
  position: fixed;
  z-index: 0;
  right: -22px;
  left: -22px;
  z-index: 0;
  top: 0;
  bottom: 0;
  width: calc(100% + 40px);
  height: calc(100vh + 42px);
`;

export const BackgroundImage = styled(motion.img)`
  ${(props: { blur?: boolean; src?: string }) =>
    props.src &&
    css`
      user-select: none;
      position: absolute;
      right: -22px;
      left: -22px;
      z-index: 0;
      top: -22px;
      bottom: -22px;
      width: calc(100% + 40px);
      height: calc(100vh + 42px);
      object-fit: cover;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
      background-image: url(${props.src});
      /* --webkit-filter: blur(${props.blur ? '20px' : '0px'});
      --moz-filter: blur(${props.blur ? '20px' : '0px'});
      --o-filter: blur(${props.blur ? '20px' : '0px'});
      --ms-filter: blur(${props.blur ? '20px' : '0px'});
      filter: blur(${props.blur ? '20px' : '0px'}); */
      /* backface-visibility: visible; */
      /* -webkit-perspective: 1000; */
    `}
`;

type BackgroundStyleProps = { hasWallpaper: boolean; theme: ThemeType };

export const BackgroundFill = styled(Fill)`
  position: relative;
  user-select: none;
  z-index: 1;
  background: ${(props: BackgroundStyleProps) =>
    props.hasWallpaper ? 'transparent' : props.theme.colors.bg.primary};
`;

export const BackgroundLighten = styled(Fill)`
  position: relative;
  z-index: 1;
  user-select: none;
  color: #ffffff;
  opacity: 0.45;
`;

export const BackgroundDarken = styled(Fill)`
  position: relative;
  z-index: 1;
  user-select: none;
  color: #000000;
  opacity: 0.25;
`;

import { useEffect, useMemo } from 'react';
import {
  AnimatePresence,
  AnimationControls,
  motion,
  useAnimationControls,
} from 'framer-motion';
import { darken } from 'polished';
import { createGlobalStyle, css } from 'styled-components';

import { genCSSVariables, ThemeType } from '@holium/shared';

import { useAppState } from 'renderer/stores/app.store';

import { denormalizeBounds, getMaximizedBounds } from './lib/window-manager';
import { BackgroundImage } from './system/system.styles';

type Props = {
  realmTheme: ThemeType;
  blur: boolean;
};

export const GlobalStyle = createGlobalStyle<Props>`
  ${(props) =>
    css`
      ${genCSSVariables(props.realmTheme)}
    `}

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: "Rubik", sans-serif;
    }

    #root{ 
      height: inherit;
      width: inherit;
    }

    /* Scroll bar stylings */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      
    }

    /* Track */
    ::-webkit-scrollbar-track {
      border-radius: 4px;
      margin-top: 4px;
      margin-bottom: 4px;
      background: ${(props) => darken(0.02, props.realmTheme.windowColor)}; 
    }
    
    /* Handle */
    ::-webkit-scrollbar-thumb {
      width: 6px;
      background: ${(props) => darken(0.08, props.realmTheme.windowColor)}; 
      border-radius: 5px;
      transition: .25s ease;
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
      transition: .25s ease;
      background: ${(props) => darken(0.1, props.realmTheme.windowColor)}; 
    }

    body {
      background-color: rgba(var(--rlm-base-rgba));
      transition: background-color 1s ease;
      color: rgba(var(--rlm-text-rgba));
      height: 100vh;
      width: 100vw;
      margin: 0;
      overflow: hidden;
      position: relative;
    }

    li {
      list-style: none;
    }

    ul {
      margin-block-start: 0em;
      margin-block-end: 0em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
      padding-inline-start: 0px;
    }

    fieldset {
      border: 0;
    }
`;

type GhostPaneProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  controls: AnimationControls;
};

const GhostPane = ({ x, y, width, height, controls }: GhostPaneProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    exit={{ opacity: 0 }}
    animate={controls}
    style={{
      x,
      y,
      width,
      height,
      borderRadius: 8,
      zIndex: 0,
      backgroundColor: 'rgba(var(--rlm-dock-rgba))',
      position: 'absolute',
    }}
    transition={{
      opacity: { duration: 0.2 },
    }}
  />
);

export const RealmBackground = ({
  blurred,
  wallpaper,
  snapView,
}: {
  blurred: boolean;
  wallpaper: string;
  snapView: string;
}) => {
  const { shellStore } = useAppState();
  const mb = getMaximizedBounds(shellStore.desktopDimensions);
  const dmb = denormalizeBounds(mb, shellStore.desktopDimensions);
  const leftControls = useAnimationControls();
  const rightControls = useAnimationControls();
  const fullscreenControls = useAnimationControls();

  useEffect(() => {
    switch (snapView) {
      case 'none':
        leftControls.start({ opacity: 0 });
        rightControls.start({ opacity: 0 });
        fullscreenControls.start({ opacity: 0 });
        break;
      case 'left':
        leftControls.start({ opacity: 1 });
        break;
      case 'right':
        rightControls.start({ opacity: 1 });
        break;
      case 'fullscreen':
        fullscreenControls.start({ opacity: 1 });
        break;
    }
  }, [snapView]);

  return useMemo(
    () => (
      <AnimatePresence>
        <BackgroundImage
          key={wallpaper}
          src={wallpaper}
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          animate={{
            opacity: 1,
            filter: blurred ? `blur(24px)` : 'blur(0px)',
          }}
          transition={{
            opacity: { duration: 0.5 },
          }}
        />
        <GhostPane
          x={dmb.x}
          y={dmb.y}
          width={dmb.width}
          height={dmb.height}
          controls={fullscreenControls}
        />
        <GhostPane
          x={dmb.x}
          y={dmb.y}
          width={dmb.width / 2}
          height={dmb.height}
          controls={leftControls}
        />
        <GhostPane
          x={dmb.x + dmb.width / 2}
          y={dmb.y}
          width={dmb.width / 2}
          height={dmb.height}
          controls={rightControls}
        />
      </AnimatePresence>
    ),
    [blurred, wallpaper]
  );
};

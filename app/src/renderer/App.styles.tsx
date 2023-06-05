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
  controls: AnimationControls;
};

const GhostPane = ({ controls }: GhostPaneProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      animate={controls}
      style={{
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
};

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
  const controls = useAnimationControls();

  useEffect(() => {
    const mb = getMaximizedBounds(shellStore.desktopDimensions);
    const dmb = denormalizeBounds(mb, shellStore.desktopDimensions);

    switch (snapView) {
      case 'none':
        controls.start({ opacity: 0, zIndex: 0 });
        break;
      case 'left':
        // 1. get the ghost pane into the correct position
        // 2. show it.
        controls.start({
          x: dmb.x + 8,
          y: dmb.y,
          width: dmb.width / 2,
          height: dmb.height,
          zIndex: shellStore.windows.size,
          transition: {
            duration: 0,
          },
        });
        controls.start({ opacity: 1 });
        break;
      case 'right':
        controls.start({
          x: dmb.x + 8 + dmb.width / 2,
          y: dmb.y,
          width: dmb.width / 2,
          height: dmb.height,
          zIndex: shellStore.windows.size,
          transition: {
            duration: 0,
          },
        });
        controls.start({ opacity: 1 });
        break;
      case 'fullscreen':
        controls.start({
          x: dmb.x + 8,
          y: dmb.y,
          width: dmb.width,
          height: dmb.height,
          zIndex: shellStore.windows.size,
          transition: {
            duration: 0,
          },
        });
        controls.start({ opacity: 1 });
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
            filter: blurred ? `var(--blur)` : 'blur(0px)',
          }}
          transition={{
            opacity: { duration: 0.5 },
          }}
        />
        <GhostPane controls={controls} />
      </AnimatePresence>
    ),
    [blurred, wallpaper]
  );
};

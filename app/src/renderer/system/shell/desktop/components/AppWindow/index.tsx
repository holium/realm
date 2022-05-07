import React, { FC, useState, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useDragControls,
  DragControls,
} from 'framer-motion';
import { rgba, lighten } from 'polished';
import styled from 'styled-components';

import { ThemeType } from '../../../../../theme';
import { WindowThemeType } from '../../../../../logic/stores/config';
import { Fill } from 'react-spaces';
import { Titlebar } from './components/Titlebar';
import { AppView } from './components/AppView';
import { useMst } from '../../../../../logic/store';
import { observer } from 'mobx-react';
import {
  DragHandleWrapper,
  LeftDragHandleStyle,
  RightDragHandleStyle,
} from './components/DragHandles';
import { Flex } from 'renderer/components';
import { DEFAULT_APP_WINDOW_DIMENSIONS } from '../../../../../logic/space/app/dimensions';

type AppWindowStyleProps = {
  theme: ThemeType;
  customBg?: string;
};

export const AppWindowStyle = styled(styled(motion.div)<AppWindowStyleProps>`
  border-radius: 9px;
  --webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  -webkit-user-select: none;
  user-select: none;
  box-sizing: content-box;
  box-shadow: ${(props: AppWindowStyleProps) => props.theme.elevations.two};
  border: 1px solid
    ${(props: AppWindowStyleProps) => rgba(props.customBg!, 0.7)};
  --webkit-transform: translate3d(0, 0, 0);
`)<AppWindowStyleProps>({
  // @ts-expect-error annoying
  backgroundColor: (props: SystemBarStyleProps) =>
    props.customBg ? rgba(lighten(0.22, props.customBg!), 0.8) : 'initial',
});

type AppWindowProps = {
  theme: Partial<WindowThemeType>;
  hideTitlebar?: boolean;
  children?: React.ReactNode;
};

export const AppWindow: FC<AppWindowProps> = observer(
  (props: AppWindowProps) => {
    const { theme } = props;
    const { textColor, windowColor } = theme;
    const { desktopStore } = useMst();
    const dragControls = useDragControls();
    const [isResizing, setIsResizing] = useState(false);

    const activeApp = desktopStore.activeApp;
    const appId: any = activeApp?.id;

    const mX = useMotionValue(120);
    const mY = useMotionValue(16);
    const mHeight = useMotionValue(
      appId ? DEFAULT_APP_WINDOW_DIMENSIONS[appId].height : 600
    );
    const mWidth = useMotionValue(
      appId ? DEFAULT_APP_WINDOW_DIMENSIONS[appId].width : 600
    );
    const resizeRightX = useMotionValue(0);
    const resizeRightY = useMotionValue(0);

    // TODO make this more efficient when resizing smaller
    const handleResize = useCallback((event, info) => {
      event.stopPropagation();
      event.preventDefault();
      resizeRightX.set(resizeRightX.get() - info.offset.x);
      resizeRightY.set(resizeRightY.get() - info.offset.y);
      // if we are greater than the minimum or are moving in the postive direction
      if (mWidth.get() >= 400 || info.delta.x > 0) {
        mWidth.set(mWidth.get() + info.delta.x);
      }
      if (mHeight.get() >= 400 || info.delta.y > 0) {
        mHeight.set(mHeight.get() + info.delta.y);
      }
    }, []);

    return (
      <Fill
        style={{
          bottom: 50,
          padding: '8px',
          paddingTop: desktopStore.isFullscreen ? 0 : 30,
        }}
      >
        <AppWindowStyle
          // drag
          id={`app-window-${activeApp?.id}`}
          dragTransition={{ bounceStiffness: 1000, bounceDamping: 100 }}
          dragElastic={0}
          dragMomentum={false}
          // TODO do math to get edge distance
          // dragConstraints={{
          //   top: 0,
          //   left: 0,
          //   right: 0,
          //   bottom: 0,
          // }}
          dragListener={false}
          drag={!isResizing}
          dragControls={dragControls}
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.15,
            },
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.1,
            },
          }}
          style={{
            // overflow: 'hidden',
            width: mWidth,
            height: mHeight,
          }}
          color={textColor}
          customBg={windowColor}
        >
          <Flex
            flexDirection="column"
            style={{
              overflow: 'hidden',
              borderRadius: 9,
              height: 'inherit',
              width: 'inherit',
            }}
          >
            <Titlebar
              isAppWindow
              closeButton
              hasBorder
              dragControls={dragControls}
              theme={theme}
              app={desktopStore.activeApp}
            />
            <AppView
              isResizing={isResizing}
              windowDimensions={{
                x: mX,
                y: mY,
                height: mHeight,
                width: mWidth,
              }}
              hasTitlebar
              app={desktopStore.activeApp}
            />
            <DragHandleWrapper>
              {/* <LeftDragHandleStyle drag onDrag={handleResize} /> */}
              <RightDragHandleStyle
                drag
                style={{
                  x: resizeRightX,
                  y: resizeRightY,
                }}
                onDrag={handleResize}
                onPointerDown={(e: any) => {
                  setIsResizing(true);
                }}
                onPointerUp={() => setIsResizing(false)}
                onPanEnd={() => setIsResizing(false)}
                onTap={() => setIsResizing(false)}
                whileDrag={{}}
                dragMomentum={false}
              />
            </DragHandleWrapper>
          </Flex>
        </AppWindowStyle>
      </Fill>
    );
  }
);

AppWindow.defaultProps = {
  hideTitlebar: false,
};

export default AppWindow;

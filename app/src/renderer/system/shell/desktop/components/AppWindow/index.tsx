import React, { FC, useState, useCallback, useRef } from 'react';
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
import { Titlebar } from './components/Titlebar';
import { AppView } from './components/AppView';
import { useMst } from '../../../../../logic/store';
import { observer } from 'mobx-react';
import {
  DragHandleWrapper,
  RightDragHandleStyle,
} from './components/DragHandles';
import { Flex } from 'renderer/components';
import { toJS } from 'mobx';
import { number } from 'yup';
type AppWindowStyleProps = {
  theme: ThemeType;
  customBg?: string;
};

export const AppWindowStyle = styled(styled(motion.div)<AppWindowStyleProps>`
  border-radius: 9px;
  --webkit-backdrop-filter: var(--blur-enabled);
  backdrop-filter: var(--blur-enabled);
  -webkit-user-select: none;
  --webkit-backface-visibility: hidden;
  --webkit-transform: translate3d(0, 0, 0);
  --webkit-perspective: 1000;
  transform: translateZ(0);
  user-select: none;
  box-sizing: content-box;
  box-shadow: ${(props: AppWindowStyleProps) => props.theme.elevations.two};
  border: 1px solid
    ${(props: AppWindowStyleProps) => rgba(props.customBg!, 0.7)};
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
    const [unmaximize, setUnmaximize] = useState<
      | {
          x: number;
          y: number;
          height: number;
          width: number;
        }
      | undefined
    >();
    const dragControls = useDragControls();
    const [isResizing, setIsResizing] = useState(false);
    const desktopRef = useRef<any>(null);

    const activeApp = desktopStore.activeApp;

    const mX = useMotionValue(activeApp ? activeApp.dimensions.x : 20);
    const mY = useMotionValue(activeApp ? activeApp.dimensions.y : 20);
    const mHeight = useMotionValue(
      activeApp ? activeApp.dimensions.height : 600
    );
    const mWidth = useMotionValue(activeApp ? activeApp.dimensions.width : 600);
    const resizeRightX = useMotionValue(0);
    const resizeRightY = useMotionValue(0);

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

    // Toggles maximize or not
    const maximize = useCallback(() => {
      if (!unmaximize) {
        setUnmaximize({
          x: mX.get(),
          y: mY.get(),
          height: mHeight.get(),
          width: mWidth.get(),
        });
        const offset = desktopStore.isFullscreen ? 0 : 30;
        // @ts-ignore
        const desktopDims = desktopRef.current!.getBoundingClientRect();
        mX.set(0);
        mY.set(8);
        mHeight.set(desktopDims.height - (16 + offset) - 50);
        mWidth.set(desktopDims.width - 16);
      } else {
        mX.set(unmaximize.x);
        mY.set(unmaximize.y);
        mHeight.set(unmaximize.height);
        mWidth.set(unmaximize.width);
        setUnmaximize(undefined);
      }
      activeApp &&
        desktopStore.setDimensions(activeApp.id, {
          x: mX.get(),
          y: mY.get(),
          height: mHeight.get(),
          width: mWidth.get(),
        });
    }, [desktopStore.isFullscreen, activeApp, unmaximize, setUnmaximize]);

    const onDragStop = (e: any) => {
      activeApp &&
        desktopStore.setDimensions(activeApp.id, {
          x: mX.get(),
          y: mY.get(),
          height: mHeight.get(),
          width: mWidth.get(),
        });
    };

    const onClose = () => {
      desktopStore.activeApp
        ? desktopStore.closeBrowserWindow(desktopStore.activeApp?.id)
        : {};
    };

    const windowId = `app-window-${activeApp?.id}`;

    return (
      <div
        ref={desktopRef}
        style={{
          bottom: 0,
          padding: '8px',
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          height: `calc(100vh - ${desktopStore.isFullscreen ? 0 : 30}px)`,
          paddingTop: desktopStore.isFullscreen ? 0 : 30,
        }}
      >
        <AppWindowStyle
          id={windowId}
          dragTransition={{ bounceStiffness: 1000, bounceDamping: 100 }}
          dragElastic={0}
          dragMomentum={false}
          // dragConstraints={desktopRef}
          dragListener={false}
          drag={!isResizing}
          dragControls={dragControls}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
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
            x: mX,
            y: mY,
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
              maximizeButton
              closeButton
              hasBorder
              shareable
              dragControls={dragControls}
              onDragStop={(e: any) => onDragStop(e)}
              onClose={() => onClose()}
              onMaximize={() => maximize()}
              theme={theme}
              app={desktopStore.activeApp}
            />
            <AppView
              hasTitlebar
              isResizing={isResizing}
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
                onPointerUp={() => {
                  setIsResizing(false);
                  activeApp &&
                    desktopStore.setDimensions(activeApp.id, {
                      x: mX.get(),
                      y: mY.get(),
                      height: mHeight.get(),
                      width: mWidth.get(),
                    });
                }}
                onPanEnd={() => setIsResizing(false)}
                onTap={() => setIsResizing(false)}
                whileDrag={{}}
                dragMomentum={false}
              />
            </DragHandleWrapper>
          </Flex>
        </AppWindowStyle>
      </div>
    );
  }
);

AppWindow.defaultProps = {
  hideTitlebar: false,
};

export default AppWindow;

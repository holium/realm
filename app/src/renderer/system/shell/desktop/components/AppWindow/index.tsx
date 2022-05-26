import React, { FC, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useDragControls } from 'framer-motion';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';
import styled from 'styled-components';

import { ThemeType } from '../../../../../theme';
import { WindowThemeType } from '../../../../../logic/stores/config';
import { WindowModelType } from '../../../../../logic/desktop/store';
import { useMst } from '../../../../../logic/store';
import { Titlebar } from './components/Titlebar';
import { AppView } from './components/AppView';
import {
  DragHandleWrapper,
  RightDragHandleStyle,
} from './components/DragHandles';
import { Flex } from 'renderer/components';
import { toJS } from 'mobx';
import { NativeView } from './components/NativeView';
import { nativeApps } from 'renderer/system/apps';

type AppWindowStyleProps = {
  theme: ThemeType;
  customBg?: string;
};

export const AppWindowStyle = styled(styled(motion.div)<AppWindowStyleProps>`
  position: absolute;
  border-radius: 9px;
  box-sizing: content-box;
  box-shadow: ${(props: AppWindowStyleProps) => props.theme.elevations.two};
  border: 1px solid
    ${(props: AppWindowStyleProps) => darken(0.1, props.customBg!)};
`)<AppWindowStyleProps>({
  // @ts-expect-error annoying
  backgroundColor: (props: SystemBarStyleProps) =>
    props.customBg ? darken(0.002, props.customBg!) : 'initial',
});

type AppWindowProps = {
  theme: Partial<WindowThemeType>;
  window: WindowModelType;
  hideTitlebar?: boolean;
  children?: React.ReactNode;
  desktopRef: any;
};

export const AppWindow: FC<AppWindowProps> = observer(
  (props: AppWindowProps) => {
    const { theme, window, desktopRef } = props;
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

    const activeWindow = window;

    const mX = useMotionValue(activeWindow ? activeWindow.dimensions.x : 20);
    const mY = useMotionValue(activeWindow ? activeWindow.dimensions.y : 20);
    const mHeight = useMotionValue(
      activeWindow ? activeWindow.dimensions.height : 600
    );
    const mWidth = useMotionValue(
      activeWindow ? activeWindow.dimensions.width : 600
    );
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
      activeWindow &&
        desktopStore.setDimensions(activeWindow.id, {
          x: mX.get(),
          y: mY.get(),
          height: mHeight.get(),
          width: mWidth.get(),
        });
    }, [desktopStore.isFullscreen, activeWindow, unmaximize, setUnmaximize]);

    const onDragStop = () => {
      activeWindow &&
        desktopStore.setDimensions(activeWindow.id, {
          x: mX.get(),
          y: mY.get(),
          height: mHeight.get(),
          width: mWidth.get(),
        });
    };

    // useEffect(() => {
    //   const desktopDims = desktopRef.current!.getBoundingClientRect();

    // }, []);

    const onClose = () => {
      desktopStore.activeWindow
        ? desktopStore.closeBrowserWindow(desktopStore.activeWindow?.id)
        : {};
    };

    const windowId = `app-window-${activeWindow?.id}`;
    let hideTitlebar = false;
    let showDevToolsToggle = true;
    let preventClickEvents = true;
    if (window.type === 'native') {
      hideTitlebar = nativeApps[window.id].native!.hideTitlebar!;
      showDevToolsToggle = false;
      preventClickEvents = false;
    }

    return (
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
          zIndex: window.zIndex,
        }}
        color={textColor}
        customBg={windowColor}
        onMouseDown={(evt: any) => {
          // preventClickEvents && evt.stopPropagation();
          desktopStore.setActive(window);
        }}
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
            hasBorder={!hideTitlebar}
            showDevToolsToggle={showDevToolsToggle}
            // shareable
            dragControls={dragControls}
            onDragStop={() => onDragStop()}
            onClose={() => onClose()}
            onMaximize={() => maximize()}
            theme={{ ...theme, windowColor: darken(0.002, theme.windowColor!) }}
            app={window}
          />
          <WindowType hasTitlebar isResizing={isResizing} window={window} />
          <DragHandleWrapper>
            {/* <LeftDragHandleStyle drag onDrag={handleResize} /> */}
            <RightDragHandleStyle
              className="app-window-resize app-window-resize-br"
              drag
              style={{
                x: resizeRightX,
                y: resizeRightY,
              }}
              onDrag={handleResize}
              onPointerDown={() => {
                setIsResizing(true);
              }}
              onPointerUp={() => {
                setIsResizing(false);
                activeWindow &&
                  desktopStore.setDimensions(activeWindow.id, {
                    x: mX.get(),
                    y: mY.get(),
                    height: mHeight.get(),
                    width: mWidth.get(),
                  });
              }}
              onPanEnd={() => setIsResizing(false)}
              onTap={() => setIsResizing(false)}
              dragMomentum={false}
            />
          </DragHandleWrapper>
        </Flex>
      </AppWindowStyle>
    );
  }
);

AppWindow.defaultProps = {
  hideTitlebar: false,
};

export default AppWindow;

type WindowTypeProps = {
  hasTitlebar: boolean;
  isResizing: boolean;
  window: WindowModelType;
};

export const WindowType: FC<WindowTypeProps> = (props: WindowTypeProps) => {
  const { hasTitlebar, isResizing, window } = props;
  let appWindow;
  switch (window.type) {
    case 'native':
      return (
        <NativeView
          hasTitlebar={nativeApps[window.id].native?.hideTitlebar}
          window={window}
        />
      );
    case 'urbit':
      return (
        <AppView
          hasTitlebar={hasTitlebar}
          isResizing={isResizing}
          window={window}
        />
      );

    default:
      return;
  }
  return appWindow;
};

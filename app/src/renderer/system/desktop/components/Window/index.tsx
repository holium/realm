import React, { FC, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useDragControls } from 'framer-motion';
import { observer } from 'mobx-react';
import { darken } from 'polished';
import styled from 'styled-components';

import { ThemeType } from '../../../../theme';
import { WindowModelProps } from 'os/services/shell/desktop.model';
import { Titlebar } from './Titlebar';
import { AppView } from './AppView';
import { WebView } from './WebView';
import { DragHandleWrapper, RightDragHandleStyle } from './DragHandles';
import { Flex } from 'renderer/components';
import { toJS } from 'mobx';
import { NativeView } from './NativeView';
import { nativeApps } from 'renderer/apps';
import { nativeRenderers } from 'renderer/apps/native';
import { BrowserToolbarProps } from 'renderer/apps/Browser/Toolbar';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { DialogView } from '../../../dialog/Dialog/Dialog';
import {
  DialogTitlebar,
  DialogTitlebarProps,
} from '../../../dialog/Dialog/DialogTitlebar';
import { DialogConfig, dialogRenderers } from 'renderer/system/dialog/dialogs';

interface AppWindowStyleProps {
  theme: ThemeType;
  customBg?: string;
}

export const AppWindowStyle = styled(motion.div)<AppWindowStyleProps>`
  position: absolute;
  border-radius: 9px;
  overflow: hidden;
  box-sizing: content-box;
  transform: transale3d(0, 0, 0);
  box-shadow: ${(props: AppWindowStyleProps) => props.theme.elevations.two};
  border: 1px solid
    ${(props: AppWindowStyleProps) => darken(0.1, props.customBg!)};
`;

interface AppWindowProps {
  window: WindowModelProps;
  hideTitlebar?: boolean;
  children?: React.ReactNode;
  desktopRef: any;
}

export const AppWindow: FC<AppWindowProps> = observer(
  (props: AppWindowProps) => {
    const { window, desktopRef } = props;
    const { shell, bazaar, desktop, theme } = useServices();
    const { textColor, windowColor } = theme.currentTheme;

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
    const [isDragging, setIsDragging] = useState(false);

    const activeWindow = window;

    const mX = useMotionValue(activeWindow ? activeWindow.dimensions.x : 20);
    const mY = useMotionValue(activeWindow ? activeWindow.dimensions.y : 20);
    const mHeight = useMotionValue(
      activeWindow ? activeWindow.dimensions.height : 600
    );
    const mWidth = useMotionValue(
      activeWindow ? activeWindow.dimensions.width : 600
    );

    useEffect(() => {
      mX.set(activeWindow.dimensions.x);
      mY.set(activeWindow.dimensions.y);
      mWidth.set(activeWindow.dimensions.width);
      mHeight.set(activeWindow.dimensions.height);
    }, [activeWindow.dimensions.width, activeWindow.dimensions.height]);

    const windowId = `app-window-${activeWindow?.id}`;

    useEffect(() => {
      const windowEl = document.getElementById(windowId);
      if (windowEl) {
        windowEl.style.zIndex = `${window.zIndex}`;
      }
    }, [window.zIndex]);

    const resizeRightX = useMotionValue(0);
    const resizeRightY = useMotionValue(0);

    const handleResize = useCallback((event: any, info: any) => {
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
        const offset = shell.isFullscreen ? 0 : 30;
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
        DesktopActions.setAppDimensions(activeWindow.id, {
          x: Math.round(mX.get()),
          y: Math.round(mY.get()),
          height: Math.round(mHeight.get()),
          width: Math.round(mWidth.get()),
        });
    }, [shell.isFullscreen, activeWindow, unmaximize, setUnmaximize]);

    const onDragStop = () => {
      setIsDragging(false);
      activeWindow &&
        DesktopActions.setAppDimensions(activeWindow.id, {
          x: Math.round(mX.get()),
          y: Math.round(mY.get()),
          height: Math.round(mHeight.get()),
          width: Math.round(mWidth.get()),
        });
    };

    const onDragStart = () => {
      setIsDragging(true);
    };

    const onClose = () => {
      desktop.activeWindow
        ? DesktopActions.closeAppWindow('', toJS(activeWindow))
        : {};
    };

    let webviewId = `${activeWindow.id}-urbit-webview`;
    if (window.type === 'web') {
      webviewId = `${activeWindow.id}-web-webview`;
    }

    const onDevTools = useCallback(() => {
      console.log(webviewId);
      const webview: any = document.getElementById(webviewId);
      webview.isDevToolsOpened()
        ? webview.closeDevTools()
        : webview.openDevTools();
    }, [webviewId]);

    const onMouseDown = () => {
      DesktopActions.setActive('', window.id);
    };

    let hideTitlebarBorder = false;
    let noTitlebar = false;
    let CustomTitlebar:
      | React.FC<BrowserToolbarProps>
      | React.FC<DialogTitlebarProps>
      | undefined; // todo fix typings
    let showDevToolsToggle = true;
    let preventClickEvents = true;
    let maximizeButton = true;
    let borderRadius = 12;
    const appInfo = bazaar.getApp(window.id);
    if (appInfo?.type === 'urbit') {
      hideTitlebarBorder = !appInfo.config?.titlebarBorder || false;
      // noTitlebar = !appInfo.config?.showTitlebar || false;
    }
    let titlebar = (
      <Titlebar
        isAppWindow
        maximizeButton={maximizeButton}
        minimizeButton
        closeButton
        noTitlebar={noTitlebar}
        hasBorder={!hideTitlebarBorder}
        showDevToolsToggle={showDevToolsToggle}
        zIndex={window.zIndex}
        dragControls={dragControls}
        onDevTools={onDevTools}
        onDragStart={() => onDragStart()}
        onDragStop={() => onDragStop()}
        onClose={() => onClose()}
        onMaximize={() => maximize()}
        onMinimize={() => {
          DesktopActions.toggleMinimized('', window.id);
        }}
        theme={theme.currentTheme}
        app={window}
      />
    );
    if (window.type === 'native') {
      hideTitlebarBorder = nativeApps[window.id].native!.hideTitlebarBorder!;
      noTitlebar = nativeApps[window.id].native!.noTitlebar!;
      CustomTitlebar = nativeRenderers[window.id].titlebar!;
      showDevToolsToggle = false;
      preventClickEvents = false;
      if (CustomTitlebar) {
        titlebar = (
          <CustomTitlebar
            zIndex={window.zIndex}
            windowColor={darken(0.002, windowColor)}
            showDevToolsToggle
            dragControls={dragControls}
            onDragStart={() => onDragStart()}
            onDragStop={() => onDragStop()}
            onClose={() => onClose()}
            onMaximize={() => maximize()}
          />
        );
      } else {
        titlebar = (
          <Titlebar
            isAppWindow
            maximizeButton={maximizeButton}
            minimizeButton
            closeButton
            noTitlebar={noTitlebar}
            hasBorder={!hideTitlebarBorder}
            showDevToolsToggle={showDevToolsToggle}
            zIndex={window.zIndex}
            dragControls={dragControls}
            onDevTools={onDevTools}
            onDragStart={() => onDragStart()}
            onDragStop={() => onDragStop()}
            onClose={() => onClose()}
            onMinimize={() => {
              DesktopActions.toggleMinimized('', window.id);
            }}
            onMaximize={() => maximize()}
            theme={theme.currentTheme}
            app={window}
          />
        );
      }
    }
    if (window.type === 'dialog') {
      hideTitlebarBorder = true;
      const dialogRenderer = dialogRenderers[window.id];
      const dialogConfig: DialogConfig =
        dialogRenderer instanceof Function
          ? dialogRenderer(shell.dialogProps.toJSON())
          : dialogRenderer;
      noTitlebar = dialogConfig.noTitlebar!;
      CustomTitlebar = DialogTitlebar;
      showDevToolsToggle = false;
      preventClickEvents = false;
      maximizeButton = false;
      borderRadius = 16;
      const onCloseDialog = dialogConfig.onClose;
      const onOpenDialog = dialogConfig.onOpen;
      useEffect(() => {
        // trigger onOpen only once
        onOpenDialog && onOpenDialog();
      }, [onOpenDialog]);
      if (noTitlebar) {
        titlebar = <div />;
      } else {
        titlebar = (
          <CustomTitlebar
            zIndex={window.zIndex}
            windowColor={darken(0.002, windowColor)}
            showDevToolsToggle
            dragControls={dragControls}
            onDragStart={() => onDragStart()}
            onDragStop={() => onDragStop()}
            onClose={onCloseDialog}
            onMaximize={() => maximize()}
          />
        );
      }
    }

    return useMemo(
      () => (
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
            // display: window.minimized ? 'none' : 'block',
          }}
          transition={{
            background: { duration: 0.25 },
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
            borderRadius,
            background: windowColor,
            display: window.minimized ? 'none' : 'block',
          }}
          color={textColor}
          customBg={windowColor}
          onMouseDown={onMouseDown}
        >
          <Flex
            flexDirection="column"
            style={{
              overflow: 'hidden',
              borderRadius,
              height: 'inherit',
              width: 'inherit',
            }}
          >
            {titlebar}
            <WindowType
              hasTitlebar
              isResizing={isResizing}
              isDragging={isDragging}
              window={window}
            />
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
                    DesktopActions.setAppDimensions(activeWindow.id, {
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
      ),
      [
        theme.currentTheme,
        window.dimensions,
        window.minimized,
        unmaximize,
        isResizing,
        isDragging,
        mHeight,
        mWidth,
        mX,
        mY,
      ]
    );
  }
);

AppWindow.defaultProps = {
  hideTitlebar: false,
};

export default AppWindow;

interface WindowTypeProps {
  hasTitlebar: boolean;
  isResizing: boolean;
  isDragging: boolean;
  window: WindowModelProps;
}

export const WindowType: FC<WindowTypeProps> = (props: WindowTypeProps) => {
  const { hasTitlebar, isResizing, isDragging, window } = props;
  switch (window.type) {
    case 'native':
      return (
        <NativeView
          isResizing={isResizing}
          hasTitlebar={nativeApps[window.id].native?.hideTitlebarBorder}
          window={window}
        />
      );
    case 'urbit':
      return (
        <AppView
          isDragging={isDragging}
          hasTitlebar={hasTitlebar}
          isResizing={isResizing}
          window={window}
        />
      );
    case 'web':
      return (
        <WebView
          hasTitlebar={hasTitlebar}
          isResizing={isResizing}
          window={window}
        />
      );
    case 'dev':
      return (
        <WebView
          hasTitlebar={hasTitlebar}
          isResizing={isResizing}
          window={window}
        />
      );

    case 'dialog':
      return <DialogView window={window} />;
    default:
      return <div>No view</div>;
  }
};

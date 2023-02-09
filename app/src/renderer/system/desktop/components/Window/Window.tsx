import { useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { motion, useMotionValue, useDragControls } from 'framer-motion';
import { observer } from 'mobx-react';
import { darken } from 'polished';
import styled from 'styled-components';

import { ThemeType } from '../../../../theme';
import { WindowModelType } from '../../../../../os/services/shell/desktop.model';
import { Titlebar } from './Titlebar';
import { WindowByType } from './WindowByType';
import { DragHandleWrapper, RightDragHandleStyle } from './DragHandles';
import { Flex } from 'renderer/components';
import { toJS } from 'mobx';
import { nativeApps } from 'renderer/apps';
import { nativeRenderers, AppId } from 'renderer/apps/native';
import { BrowserToolbarProps } from 'renderer/apps/Browser/Toolbar/Toolbar';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import {
  DialogTitlebar,
  DialogTitlebarProps,
} from '../../../dialog/Dialog/DialogTitlebar';
import { DialogConfig, dialogRenderers } from 'renderer/system/dialog/dialogs';
import { getWebViewId } from 'renderer/system/desktop/components/Window/util';

interface AppWindowStyleProps {
  theme: ThemeType;
  customBg?: string;
}

const AppWindowStyle = styled(motion.div)<AppWindowStyleProps>`
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
  window: WindowModelType;
  children?: ReactNode;
  desktopRef: any;
}

const AppWindowPresenter = ({ window, desktopRef }: AppWindowProps) => {
  const { shell, bazaar, theme } = useServices();
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

  const motionX = useMotionValue(activeWindow ? activeWindow.bounds.x : 20);
  const motionY = useMotionValue(activeWindow ? activeWindow.bounds.y : 20);
  const motionHeight = useMotionValue(
    activeWindow ? activeWindow.bounds.height : 600
  );
  const motionWidth = useMotionValue(
    activeWindow ? activeWindow.bounds.width : 600
  );

  useEffect(() => {
    motionX.set(activeWindow.bounds.x);
    motionY.set(activeWindow.bounds.y);
    motionWidth.set(activeWindow.bounds.width);
    motionHeight.set(activeWindow.bounds.height);
  }, [activeWindow.bounds]);

  const windowId = `app-window-${activeWindow.appId}`;
  const webViewId = getWebViewId(activeWindow.appId, window.type!);

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
    if (motionWidth.get() >= 400 || info.delta.x > 0) {
      motionWidth.set(motionWidth.get() + info.delta.x);
    }
    if (motionHeight.get() >= 400 || info.delta.y > 0) {
      motionHeight.set(motionHeight.get() + info.delta.y);
    }
  }, []);

  // Toggles maximize or not
  const maximize = () => {
    if (!unmaximize) {
      setUnmaximize({
        x: motionX.get(),
        y: motionY.get(),
        height: motionHeight.get(),
        width: motionWidth.get(),
      });
      const offset = Boolean(shell.isFullscreen) ? 0 : 30;
      const desktopDims = desktopRef.current!.getBoundingClientRect();
      motionX.set(0);
      motionY.set(8);
      motionHeight.set(desktopDims.height - (16 + offset) - 50);
      motionWidth.set(desktopDims.width - 16);
    } else {
      motionX.set(unmaximize.x);
      motionY.set(unmaximize.y);
      motionHeight.set(unmaximize.height);
      motionWidth.set(unmaximize.width);
      setUnmaximize(undefined);
    }
    activeWindow &&
      DesktopActions.setWindowBounds(activeWindow.appId, {
        x: Math.round(motionX.get()),
        y: Math.round(motionY.get()),
        height: Math.round(motionHeight.get()),
        width: Math.round(motionWidth.get()),
      });
  };
  const onDragStop = () => {
    setIsDragging(false);
    activeWindow &&
      DesktopActions.setWindowBounds(activeWindow.appId, {
        x: Math.round(motionX.get()),
        y: Math.round(motionY.get()),
        height: Math.round(motionHeight.get()),
        width: Math.round(motionWidth.get()),
      });
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onClose = () => {
    activeWindow.isActive
      ? DesktopActions.closeAppWindow('', toJS(activeWindow))
      : {};
  };

  const onDevTools = useCallback(() => {
    const webView = document.getElementById(
      webViewId
    ) as Electron.WebviewTag | null;

    if (!webView) return;

    webView.isDevToolsOpened()
      ? webView.closeDevTools()
      : webView.openDevTools();
  }, [webViewId]);

  const onMouseDown = () => {
    DesktopActions.setActive('', window.appId);
  };

  let hideTitlebarBorder = false;
  let noTitlebar = false;
  let CustomTitlebar:
    | React.FC<BrowserToolbarProps>
    | React.FC<DialogTitlebarProps>
    | undefined; // todo fix typings
  let showDevToolsToggle = true;
  let maximizeButton = true;
  let borderRadius = 12;
  const appInfo = bazaar.getApp(window.appId);
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
        DesktopActions.toggleMinimized('', window.appId);
      }}
      theme={theme.currentTheme}
      app={window}
    />
  );
  if (window.type === 'native') {
    hideTitlebarBorder = nativeApps[window.appId].native!.hideTitlebarBorder!;
    noTitlebar = nativeApps[window.appId].native!.noTitlebar!;
    // @ts-ignore
    CustomTitlebar = nativeRenderers[window.appId as AppId].titlebar;
    // TODO: Remove hardcoded showDevToolsToggle
    showDevToolsToggle = true;
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
            DesktopActions.toggleMinimized('', window.appId);
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
    const dialogRenderer = dialogRenderers[window.appId];
    const dialogConfig: DialogConfig =
      dialogRenderer instanceof Function
        ? dialogRenderer(shell.dialogProps.toJSON())
        : dialogRenderer;
    noTitlebar = dialogConfig.noTitlebar!;
    CustomTitlebar = DialogTitlebar;
    showDevToolsToggle = false;
    maximizeButton = false;
    borderRadius = 16;
    const onCloseDialog = dialogConfig.onClose;
    const onOpenDialog = dialogConfig.onOpen;
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
          x: motionX,
          y: motionY,
          width: motionWidth,
          height: motionHeight,
          zIndex: window.zIndex,
          borderRadius,
          background: windowColor,
          display: window.isMinimized ? 'none' : 'block',
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
            width: '100%',
            height: '100%',
          }}
        >
          {titlebar}
          <WindowByType
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
                  DesktopActions.setWindowBounds(activeWindow.appId, {
                    x: motionX.get(),
                    y: motionY.get(),
                    height: motionHeight.get(),
                    width: motionWidth.get(),
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
      window.bounds,
      window.isMinimized,
      unmaximize,
      isResizing,
      isDragging,
      motionHeight,
      motionWidth,
      motionX,
      motionY,
    ]
  );
};

export const AppWindow = observer(AppWindowPresenter);

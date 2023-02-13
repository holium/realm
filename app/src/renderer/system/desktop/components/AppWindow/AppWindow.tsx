import { useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useDragControls,
  PanInfo,
} from 'framer-motion';
import { observer } from 'mobx-react';
import { darken } from 'polished';
import styled from 'styled-components';

import { ThemeType } from '../../../../theme';
import { WindowModelType } from '../../../../../os/services/shell/desktop.model';
import { Titlebar } from './Titlebar';
import { WindowByType } from './WindowByType';
import { LeftDragHandle, RightDragHandle } from './DragHandles';
import { Flex } from 'renderer/components';
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
import { getWebViewId } from 'renderer/system/desktop/components/AppWindow/util';
import {
  denormalizeBounds,
  normalizeBounds,
} from 'os/services/shell/lib/window-manager';

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
  appWindow: WindowModelType;
  children?: ReactNode;
}

const AppWindowPresenter = ({ appWindow }: AppWindowProps) => {
  const { shell, bazaar, theme } = useServices();
  const { textColor, windowColor } = theme.currentTheme;

  const dragControls = useDragControls();
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const activeWindow = appWindow;
  const denormalizedBounds = useMemo(
    () => denormalizeBounds(activeWindow.bounds, shell.desktopDimensions),
    [activeWindow.bounds, shell.desktopDimensions]
  );

  const motionX = useMotionValue(activeWindow ? denormalizedBounds.x : 20);
  const motionY = useMotionValue(activeWindow ? denormalizedBounds.y : 20);
  const motionHeight = useMotionValue(
    activeWindow ? denormalizedBounds.height : 600
  );
  const motionWidth = useMotionValue(
    activeWindow ? denormalizedBounds.width : 600
  );

  useEffect(() => {
    motionX.set(denormalizedBounds.x);
    motionY.set(denormalizedBounds.y);
    motionWidth.set(denormalizedBounds.width);
    motionHeight.set(denormalizedBounds.height);
  }, [activeWindow.bounds]);

  const windowId = `app-window-${activeWindow.appId}`;
  const webViewId = getWebViewId(activeWindow.appId, appWindow.type!);

  useEffect(() => {
    const windowEl = document.getElementById(windowId);
    if (windowEl) {
      windowEl.style.zIndex = `${appWindow.zIndex}`;
    }
  }, [appWindow.zIndex]);

  const resizeRightX = useMotionValue(0);
  const resizeRightY = useMotionValue(0);

  const handleBottomRightCornerResize = useCallback(
    (event: MouseEvent, info: PanInfo) => {
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

      updateWindowBounds();
    },
    []
  );

  const handleBottomLeftCornerResize = useCallback(
    (event: MouseEvent, info: PanInfo) => {
      event.stopPropagation();
      event.preventDefault();
      resizeRightX.set(resizeRightX.get() - info.offset.x);
      resizeRightY.set(resizeRightY.get() - info.offset.y);

      // if we are greater than the minimum or are moving in the postive direction
      if (motionWidth.get() >= 400 || info.delta.x < 0) {
        motionWidth.set(motionWidth.get() - info.delta.x);
        motionX.set(motionX.get() + info.delta.x);
      }
      if (motionHeight.get() >= 400 || info.delta.y > 0) {
        motionHeight.set(motionHeight.get() + info.delta.y);
      }

      updateWindowBounds();
    },
    []
  );

  const updateWindowBounds = useCallback(() => {
    DesktopActions.setWindowBounds(
      activeWindow.appId,
      normalizeBounds(
        {
          x: motionX.get(),
          y: motionY.get(),
          height: motionHeight.get(),
          width: motionWidth.get(),
        },
        shell.desktopDimensions
      )
    );
  }, [
    activeWindow.appId,
    motionX,
    motionY,
    motionHeight,
    motionWidth,
    shell.desktopDimensions,
  ]);

  const onDragStop = () => {
    setIsDragging(false);
    updateWindowBounds();
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onMaximize = async () => {
    const newBounds = await DesktopActions.toggleMaximized(activeWindow.appId);
    const denormalizedBounds = denormalizeBounds(
      newBounds,
      shell.desktopDimensions
    );
    motionX.set(denormalizedBounds.x);
    motionY.set(denormalizedBounds.y);
    motionWidth.set(denormalizedBounds.width);
    motionHeight.set(denormalizedBounds.height);
  };

  const onMinimize = () => DesktopActions.toggleMinimized(activeWindow.appId);

  const onClose = () => {
    activeWindow.isActive && DesktopActions.closeAppWindow(activeWindow.appId);
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
    DesktopActions.setActive(appWindow.appId);
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
  const appInfo = bazaar.getApp(appWindow.appId);
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
      zIndex={appWindow.zIndex}
      dragControls={dragControls}
      onDevTools={onDevTools}
      onDragStart={onDragStart}
      onDragStop={onDragStop}
      onClose={onClose}
      onMaximize={onMaximize}
      onMinimize={onMinimize}
      theme={theme.currentTheme}
      appWindow={appWindow}
    />
  );
  if (appWindow.type === 'native') {
    hideTitlebarBorder =
      nativeApps[appWindow.appId].native!.hideTitlebarBorder!;
    noTitlebar = nativeApps[appWindow.appId].native!.noTitlebar!;
    // @ts-ignore
    CustomTitlebar = nativeRenderers[appWindow.appId as AppId].titlebar;
    // TODO: Remove hardcoded showDevToolsToggle
    showDevToolsToggle = true;
    if (CustomTitlebar) {
      titlebar = (
        <CustomTitlebar
          zIndex={appWindow.zIndex}
          windowColor={darken(0.002, windowColor)}
          showDevToolsToggle
          dragControls={dragControls}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
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
          zIndex={appWindow.zIndex}
          dragControls={dragControls}
          onDevTools={onDevTools}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          theme={theme.currentTheme}
          appWindow={appWindow}
        />
      );
    }
  }
  if (appWindow.type === 'dialog') {
    hideTitlebarBorder = true;
    const dialogRenderer = dialogRenderers[appWindow.appId];
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
          zIndex={appWindow.zIndex}
          windowColor={darken(0.002, windowColor)}
          showDevToolsToggle
          dragControls={dragControls}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          onClose={onCloseDialog}
          onMaximize={onMaximize}
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
          zIndex: appWindow.zIndex,
          borderRadius,
          background: windowColor,
          display: appWindow.isMinimized ? 'none' : 'block',
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
            appWindow={appWindow}
          />
          <LeftDragHandle
            className="app-window-resize app-window-resize-lr"
            drag
            style={{
              x: resizeRightX,
              y: resizeRightY,
            }}
            onDrag={handleBottomLeftCornerResize}
            onPointerDown={() => {
              setIsResizing(true);
            }}
            onPointerUp={() => {
              setIsResizing(false);
              updateWindowBounds();
            }}
            onPanEnd={() => setIsResizing(false)}
            onTap={() => setIsResizing(false)}
            dragMomentum={false}
          />
          <RightDragHandle
            className="app-window-resize app-window-resize-br"
            drag
            style={{
              x: resizeRightX,
              y: resizeRightY,
            }}
            onDrag={handleBottomRightCornerResize}
            onPointerDown={() => {
              setIsResizing(true);
            }}
            onPointerUp={() => {
              setIsResizing(false);
              updateWindowBounds();
            }}
            onPanEnd={() => setIsResizing(false)}
            onTap={() => setIsResizing(false)}
            dragMomentum={false}
          />
        </Flex>
      </AppWindowStyle>
    ),
    [
      theme.currentTheme,
      appWindow.bounds,
      appWindow.isMinimized,
      appWindow.state,
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

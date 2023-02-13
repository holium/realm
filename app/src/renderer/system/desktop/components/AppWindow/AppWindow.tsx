import { useState, useCallback, useEffect, useMemo } from 'react';
import { useMotionValue, useDragControls, PanInfo } from 'framer-motion';
import { observer } from 'mobx-react';
import { AppWindowType } from '../../../../../os/services/shell/desktop.model';
import { AppWindowByType } from './AppWindowByType';
import {
  AppWindowContainer,
  LeftDragHandle,
  RightDragHandle,
} from './AppWindow.styles';
import { Flex } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { getWebViewId } from 'renderer/system/desktop/components/AppWindow/util';
import {
  denormalizeBounds,
  normalizeBounds,
} from 'os/services/shell/lib/window-manager';
import { TitlebarByType } from './Titlebar/TitlebarByType';

type Props = {
  appWindow: AppWindowType;
};

const AppWindowPresenter = ({ appWindow }: Props) => {
  const { shell, bazaar, theme } = useServices();
  const { textColor, windowColor } = theme.currentTheme;
  const borderRadius = appWindow.type === 'dialog' ? 16 : 12;
  const appInfo = bazaar.getApp(appWindow.appId);

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

  return (
    <AppWindowContainer
      id={windowId}
      dragTransition={{ bounceStiffness: 1000, bounceDamping: 100 }}
      dragElastic={0}
      dragMomentum={false}
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
        <TitlebarByType
          appWindow={appWindow}
          appInfo={appInfo}
          shell={shell}
          dragControls={dragControls}
          currentTheme={theme.currentTheme}
          windowColor={windowColor}
          onDevTools={onDevTools}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          onClose={onClose}
          onMaximize={onMaximize}
          onMinimize={onMinimize}
        />
        <AppWindowByType
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
    </AppWindowContainer>
  );
};

export const AppWindow = observer(AppWindowPresenter);

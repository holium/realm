import { debounce } from 'lodash';
import { PointerEvent, useCallback, useEffect, useMemo } from 'react';
import { useMotionValue, useDragControls } from 'framer-motion';
import { observer } from 'mobx-react';
import { AppWindowType } from '../../../../../os/services/shell/desktop.model';
import { AppWindowByType } from './AppWindowByType';
import { AppWindowContainer } from './AppWindow.styles';
import { AppWindowResizeHandles } from './AppWindowResizeHandles';
import { Flex } from 'renderer/components';
import { useToggle } from '@holium/design-system';
import { getWebViewId } from 'renderer/system/desktop/components/AppWindow/View/getWebViewId';
import {
  denormalizeBounds,
  normalizeBounds,
} from 'os/services/shell/lib/window-manager';
import { TitlebarByType } from './Titlebar/TitlebarByType';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

const CURSOR_WIDTH = 10;

const MIN_WIDTH = 500;
const MIN_HEIGHT = 400;

type Props = {
  appWindow: AppWindowType;
};

const AppWindowPresenter = ({ appWindow }: Props) => {
  const { shellStore } = useAppState();
  const { bazaarStore } = useShipStore();

  const dragControls = useDragControls();
  const resizing = useToggle(false);
  const dragging = useToggle(false);

  const appInfo = bazaarStore.getApp(appWindow.appId);
  const borderRadius = appWindow.type === 'dialog' ? 16 : 12;
  const bounds = useMemo(
    () => denormalizeBounds(appWindow.bounds, shellStore.desktopDimensions),
    [appWindow.bounds, shellStore.desktopDimensions]
  );

  const mouseDragX = useMotionValue(0);
  const mouseDragY = useMotionValue(0);

  const motionX = useMotionValue(bounds.x);
  const motionY = useMotionValue(bounds.y);
  const motionWidth = useMotionValue(bounds.width);
  const motionHeight = useMotionValue(bounds.height);

  const resizeTopLeftX = useMotionValue(bounds.x);
  const resizeTopLeftY = useMotionValue(bounds.y);
  const resizeTopRightX = useMotionValue(bounds.x + bounds.width);
  const resizeTopRightY = useMotionValue(bounds.y);
  const resizeBottomLeftX = useMotionValue(bounds.x);
  const resizeBottomLefty = useMotionValue(bounds.y + bounds.height);
  const resizeBottomRightX = useMotionValue(bounds.x + bounds.width);
  const resizeBottomRightY = useMotionValue(bounds.y + bounds.height);

  const isInResizeCorner = useCallback(
    (x: number, y: number) =>
      (x >= resizeTopLeftX.get() &&
        x <= resizeTopLeftX.get() + CURSOR_WIDTH &&
        y >= resizeTopLeftY.get() &&
        y <= resizeTopLeftY.get() + CURSOR_WIDTH) ||
      (x >= resizeTopRightX.get() - CURSOR_WIDTH &&
        x <= resizeTopRightX.get() &&
        y >= resizeTopRightY.get() &&
        y <= resizeTopRightY.get() + CURSOR_WIDTH) ||
      (x >= resizeBottomLeftX.get() &&
        x <= resizeBottomLeftX.get() + CURSOR_WIDTH &&
        y >= resizeBottomLefty.get() - CURSOR_WIDTH &&
        y <= resizeBottomLefty.get()) ||
      (x >= resizeBottomRightX.get() - CURSOR_WIDTH &&
        x <= resizeBottomRightX.get() &&
        y >= resizeBottomRightY.get() - CURSOR_WIDTH &&
        y <= resizeBottomRightY.get()),
    [
      resizeTopLeftX,
      resizeTopLeftY,
      resizeTopRightX,
      resizeTopRightY,
      resizeBottomLeftX,
      resizeBottomLefty,
      resizeBottomRightX,
      resizeBottomRightY,
    ]
  );

  useEffect(() => {
    motionX.set(bounds.x);
    motionY.set(bounds.y);
    motionWidth.set(bounds.width);
    motionHeight.set(bounds.height);
  }, [appWindow.bounds]);

  useEffect(() => {
    window.electron.app.onMouseMove((mousePosition, _, isDragging) => {
      if (isDragging) {
        mouseDragX.set(mousePosition.x);
        mouseDragY.set(mousePosition.y);
        // Check if the mouse is in a resize handle.
        if (
          !resizing.isOn &&
          isInResizeCorner(mousePosition.x, mousePosition.y)
        ) {
          resizing.toggleOn();
        }
      } else {
        resizing.toggleOff();
      }
    });
  }, []);

  const windowId = `app-window-${appWindow.appId}`;
  const webViewId = getWebViewId(appWindow.appId, appWindow.type);

  useEffect(() => {
    const windowEl = document.getElementById(windowId);
    if (windowEl) {
      windowEl.style.zIndex = `${appWindow.zIndex}`;
    }
  }, [appWindow.zIndex]);

  const handleTopLeftCornerResize = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      // 1/4th of the cursor should be inside the window when resizing.
      const mouseX = mouseDragX.get() - CURSOR_WIDTH;
      const mouseY = mouseDragY.get() - CURSOR_WIDTH * 0.25;

      const newWidth = motionX.get() + motionWidth.get() - mouseX;
      const newHeight = motionY.get() + motionHeight.get() - mouseY;
      const shouldUpdateWidth = newWidth > MIN_WIDTH;
      const shouldUpdateHeight = newHeight > MIN_HEIGHT;

      if (shouldUpdateWidth) {
        motionX.set(mouseX);
        motionWidth.set(newWidth);
      }
      if (shouldUpdateHeight) {
        motionY.set(mouseY);
        motionHeight.set(newHeight);
      }

      if (shouldUpdateWidth || shouldUpdateHeight) updateWindowBounds();
    },
    [mouseDragX, mouseDragY]
  );

  const handleTopRightCornerResize = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      const mouseX = mouseDragX.get() - CURSOR_WIDTH * 0.75;
      const mouseY = mouseDragY.get();

      const newWidth = mouseX - motionX.get();
      const newHeight = motionY.get() + motionHeight.get() - mouseY;

      const shouldUpdateWidth = newWidth > MIN_WIDTH;
      const shouldUpdateHeight = newHeight > MIN_HEIGHT;

      if (shouldUpdateWidth) {
        motionWidth.set(newWidth);
      }
      if (shouldUpdateHeight) {
        motionY.set(mouseY);
        motionHeight.set(newHeight);
      }

      if (shouldUpdateWidth || shouldUpdateHeight) updateWindowBounds();
    },
    [mouseDragX, mouseDragY]
  );

  const handleBottomLeftCornerResize = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      const mouseX = mouseDragX.get() - CURSOR_WIDTH;
      const mouseY = mouseDragY.get();

      const newWidth = motionX.get() + motionWidth.get() - mouseX;
      const newHeight = mouseY - motionY.get();
      const shouldUpdateWidth = newWidth > MIN_WIDTH;
      const shouldUpdateHeight = newHeight > MIN_HEIGHT;

      if (shouldUpdateWidth) {
        motionX.set(mouseX);
        motionWidth.set(newWidth);
      }
      if (shouldUpdateHeight) {
        motionHeight.set(newHeight);
      }

      if (shouldUpdateWidth || shouldUpdateHeight) updateWindowBounds();
    },
    [mouseDragX, mouseDragY]
  );

  const handleBottomRightCornerResize = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      const mouseX = mouseDragX.get() - CURSOR_WIDTH;
      const mouseY = mouseDragY.get();

      const newWidth = mouseX - motionX.get();
      const newHeight = mouseY - motionY.get();
      const shouldUpdateWidth = newWidth > MIN_WIDTH;
      const shouldUpdateHeight = newHeight > MIN_HEIGHT;

      if (shouldUpdateWidth) {
        motionWidth.set(newWidth);
      }
      if (shouldUpdateHeight) {
        motionHeight.set(newHeight);
      }

      if (shouldUpdateWidth || shouldUpdateHeight) updateWindowBounds();
    },
    [mouseDragX, mouseDragY]
  );

  const updateWindowBounds = useCallback(
    debounce(() => {
      shellStore.setWindowBounds(
        appWindow.appId,
        normalizeBounds(
          {
            x: motionX.get(),
            y: motionY.get(),
            height: motionHeight.get(),
            width: motionWidth.get(),
          },
          shellStore.desktopDimensions
        )
      );

      resizeTopLeftX.set(motionX.get());
      resizeTopLeftY.set(motionY.get());
      resizeTopRightX.set(motionX.get() + motionWidth.get());
      resizeTopRightY.set(motionY.get());
      resizeBottomLeftX.set(motionX.get());
      resizeBottomLefty.set(motionY.get() + motionHeight.get());
      resizeBottomRightX.set(motionX.get() + motionWidth.get());
      resizeBottomRightY.set(motionY.get() + motionHeight.get());
    }, 100),
    [motionX, motionY, motionWidth, motionHeight]
  );

  const onDragStart = (e: PointerEvent<HTMLDivElement>) => {
    dragging.toggleOn();
    dragControls.start(e);
  };

  const onDragEnd = () => {
    dragging.toggleOff();
    updateWindowBounds();
  };

  const onMaximize = async () => {
    const mb = shellStore.toggleMaximized(appWindow.appId);
    const dmb = denormalizeBounds(mb, shellStore.desktopDimensions);
    motionX.set(dmb.x);
    motionY.set(dmb.y);
    motionWidth.set(dmb.width);
    motionHeight.set(dmb.height);
  };

  const onMinimize = () => shellStore.toggleMinimized(appWindow.appId);

  const onClose = () =>
    appWindow.isActive && shellStore.closeWindow(appWindow.appId);

  const onDevTools = useCallback(() => {
    const webView = document.getElementById(
      webViewId
    ) as Electron.WebviewTag | null;

    if (!webView) return;

    webView.isDevToolsOpened()
      ? webView.closeDevTools()
      : webView.openDevTools();
  }, [webViewId]);

  const onMouseDown = () => shellStore.setActive(appWindow.appId);

  return (
    <AppWindowContainer
      id={windowId}
      // TODO: Use composer to determine if a window is part
      // of the singleplayer or multiplayer stack.
      // className="multiplayer-window"
      dragElastic={0}
      dragMomentum={false}
      dragListener={false}
      drag={dragging.isOn}
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
        display: appWindow.isMinimized ? 'none' : 'block',
      }}
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
          shell={shellStore}
          hideTitlebarBorder={
            appInfo?.type === 'urbit' && !appInfo.config?.titlebarBorder
          }
          onDevTools={onDevTools}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onClose={onClose}
          onMaximize={onMaximize}
          onMinimize={onMinimize}
        />
        <AppWindowByType
          isResizing={resizing.isOn}
          isDragging={dragging.isOn}
          appWindow={appWindow}
        />
        <AppWindowResizeHandles
          zIndex={appWindow.zIndex + 1}
          topRight={{
            x: resizeTopRightX,
            y: resizeTopRightY,
          }}
          topLeft={{
            x: resizeTopLeftX,
            y: resizeTopLeftY,
          }}
          bottomLeft={{
            x: resizeBottomLeftX,
            y: resizeBottomLefty,
          }}
          bottomRight={{
            x: resizeBottomRightX,
            y: resizeBottomRightY,
          }}
          onDragTopLeft={handleTopLeftCornerResize}
          onDragTopRight={handleTopRightCornerResize}
          onDragBottomLeft={handleBottomLeftCornerResize}
          onDragBottomRight={handleBottomRightCornerResize}
        />
      </Flex>
    </AppWindowContainer>
  );
};

export const AppWindow = observer(AppWindowPresenter);

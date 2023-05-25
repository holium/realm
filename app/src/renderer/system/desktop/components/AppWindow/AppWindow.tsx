import { PointerEvent, useCallback, useEffect, useMemo } from 'react';
import {
  useAnimationControls,
  useDragControls,
  useMotionValue,
} from 'framer-motion';
import { debounce } from 'lodash';
import { observer } from 'mobx-react';

import { Flex } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import {
  denormalizeBounds,
  normalizeBounds,
} from 'renderer/lib/window-manager';
import { useAppState } from 'renderer/stores/app.store';
import {
  AppWindowMobxType,
  BoundsModelType,
} from 'renderer/stores/models/window.model';
import { useShipStore } from 'renderer/stores/ship.store';
import { getWebViewId } from 'renderer/system/desktop/components/AppWindow/View/getWebViewId';

import { ErrorBoundary } from '../../../ErrorBoundary';
import { AppWindowContainer } from './AppWindow.styles';
import { AppWindowByType } from './AppWindowByType';
import { AppWindowResizeHandles } from './AppWindowResizeHandles';
import { TitlebarByType } from './Titlebar/TitlebarByType';

const CURSOR_WIDTH = 10;
const MIN_WINDOW_AMOUNT_ON_SCREEN = 64;
const TRIGGER_AUTO_RESIZE = 8;

const MIN_WIDTH = 500;
const MIN_HEIGHT = 400;

type Props = {
  appWindow: AppWindowMobxType;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const AppWindowPresenter = ({ appWindow }: Props) => {
  const { shellStore } = useAppState();
  const { bazaarStore } = useShipStore();

  const dragControls = useDragControls();
  /* true by default to make drag constraints work. */
  const dragging = useToggle(true);
  const resizing = useToggle(false);
  const nearEdge = useToggle(false);
  const controls = useAnimationControls();

  const appInfo = bazaarStore.getApp(appWindow.appId);
  const borderRadius = appWindow.type === 'dialog' ? 16 : 12;
  const bounds = useMemo(
    () => denormalizeBounds(appWindow.bounds, shellStore.desktopDimensions),
    [appWindow.bounds, shellStore.desktopDimensions]
  );

  controls.start({
    opacity: 1,
    transition: {
      duration: 0.15,
    },
  });

  const minX = 0;
  const minY = 0;
  const maxX = shellStore.desktopDimensions.width;
  const maxY = shellStore.desktopDimensions.height;

  const mouseDragX = useMotionValue((minX + maxX) / 2);
  const mouseDragY = useMotionValue((minY + maxY) / 2);

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

  const mouseIsNearEdge = (x: number, y: number, isFullscreen: boolean) => {
    const _minY = isFullscreen ? minY : minY + 30;
    return (
      x <= minX + TRIGGER_AUTO_RESIZE ||
      x >= maxX - TRIGGER_AUTO_RESIZE ||
      y <= _minY + TRIGGER_AUTO_RESIZE
    );
  };

  useEffect(() => {
    /*
      This function gets registered once.  So it can't access our state values
      (resizing, dragging.) - But it can modify them.
    */
    window.electron.app.onMouseMove((mousePosition, _, isDragging) => {
      const x = clamp(mousePosition.x, minX, maxX);
      const y = clamp(mousePosition.y, minY, maxY);
      nearEdge.setToggle(mouseIsNearEdge(x, y, shellStore.isFullscreen));

      if (isDragging) {
        mouseDragX.set(x);
        mouseDragY.set(y);

        // Check if the mouse is in a resize handle.
        // Note that this isn't enough to be actually "resizing" -
        // they must also not be dragging.
        if (isInResizeCorner(x, y)) {
          resizing.toggleOn();
        }
      } else {
        dragging.toggleOff();
        resizing.toggleOff();
      }
    });
  }, []);

  useEffect(() => {
    if (!nearEdge.isOn) {
      shellStore.hideSnapView();
      if (dragging.isOn && !resizing.isOn) {
        // dragUnmaximize();
      }
    } else {
      if (nearEdge.isOn && dragging.isOn && !resizing.isOn) {
        const x = mouseDragX.get();
        const y = mouseDragY.get();
        const _minY = shellStore.isFullscreen ? minY : minY + 30;
        if (x <= minX + TRIGGER_AUTO_RESIZE) {
          shellStore.setSnapView('left');
        } else if (y <= _minY + TRIGGER_AUTO_RESIZE) {
          shellStore.setSnapView('fullscreen');
        } else if (x >= maxX - TRIGGER_AUTO_RESIZE) {
          shellStore.setSnapView('right');
        }
      } else {
        shellStore.hideSnapView();
      }
    }
  }, [nearEdge.isOn, resizing.isOn, dragging.isOn]);

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
  const appId = useMemo(() => appWindow.appId, [appWindow.appId]);

  const updateWindowBounds = useCallback(
    debounce(() => {
      if (!shellStore.windows.has(appId)) return;

      const x = clamp(motionX.get(), minX, maxX);
      const y = clamp(motionY.get(), minY, maxY);
      const width = clamp(motionWidth.get(), minX, maxX);
      const height = clamp(motionHeight.get(), minY, maxY);

      shellStore.setWindowBounds(
        appId,
        normalizeBounds(
          {
            x: x,
            y: y,
            height: height,
            width: width,
          },
          shellStore.desktopDimensions
        )
      );

      resizeTopLeftX.set(x);
      resizeTopLeftY.set(y);
      resizeTopRightX.set(x + width);
      resizeTopRightY.set(y);
      resizeBottomLeftX.set(x);
      resizeBottomLefty.set(y + height);
      resizeBottomRightX.set(x + width);
      resizeBottomRightY.set(y + height);
    }, 100),
    [appId, motionX, motionY, motionWidth, motionHeight]
  );

  useEffect(() => {
    if (!dragging.isOn) {
      if (nearEdge.isOn && !resizing.isOn) {
        dragMaximize();
      } else {
        updateWindowBounds();
      }
    }
  }, [dragging.isOn]);

  const onDragStart = (e: PointerEvent<HTMLDivElement>) => {
    dragging.toggleOn();
    dragControls.start(e);
  };

  const onDragEnd = () => {
    dragging.toggleOff();
  };

  const setBoundsAfterMaximize = (mb: BoundsModelType) => {
    const dmb = denormalizeBounds(mb, shellStore.desktopDimensions);
    controls.start({
      x: dmb.x,
      y: dmb.y,
      width: dmb.width,
      height: dmb.height,
      transition: { duration: 0.2 },
    });
  };

  const dragMaximize = () => {
    const x = mouseDragX.get();
    const y = mouseDragY.get();
    const _minY = shellStore.isFullscreen ? minY : minY + 30;
    if (y <= _minY + TRIGGER_AUTO_RESIZE) {
      const mb = shellStore.maximize(appWindow.appId);
      setBoundsAfterMaximize(mb);
    } else {
      if (x <= minX + TRIGGER_AUTO_RESIZE) {
        const mb = shellStore.maximizeLeft(appWindow.appId);
        setBoundsAfterMaximize(mb);
      } else if (x >= maxX - TRIGGER_AUTO_RESIZE) {
        const mb = shellStore.maximizeRight(appWindow.appId);
        setBoundsAfterMaximize(mb);
      }
    }
  };

  // const dragUnmaximize = () => {
  //   const mb = shellStore.unmaximize(appWindow.appId);
  //   const dmb = denormalizeBounds(mb, shellStore.desktopDimensions);
  // };

  const onMaximize = () => {
    const mb = shellStore.toggleMaximized(appWindow.appId);
    setBoundsAfterMaximize(mb);
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
      animate={controls}
      transition={{
        background: { duration: 0.25 },
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.1,
        },
      }}
      dragConstraints={{
        top: minY - motionHeight.get() + MIN_WINDOW_AMOUNT_ON_SCREEN,
        left:
          minX - motionWidth.get() - CURSOR_WIDTH + MIN_WINDOW_AMOUNT_ON_SCREEN,
        right: maxX - CURSOR_WIDTH - MIN_WINDOW_AMOUNT_ON_SCREEN,
        bottom: maxY - MIN_WINDOW_AMOUNT_ON_SCREEN,
      }}
      style={{
        x: motionX,
        y: motionY,
        width: motionWidth,
        height: motionHeight,
        maxWidth: maxX,
        maxHeight: maxY,
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
        <ErrorBoundary>
          <AppWindowByType
            isResizing={resizing.isOn && !dragging.isOn}
            isDragging={dragging.isOn}
            appWindow={appWindow}
          />
        </ErrorBoundary>
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

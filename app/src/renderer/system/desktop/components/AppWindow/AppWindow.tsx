import { useState, useCallback, useEffect, useMemo } from 'react';
import { useMotionValue, useDragControls, PanInfo } from 'framer-motion';
import { observer } from 'mobx-react';
import { AppWindowType } from '../../../../../os/services/shell/desktop.model';
import { AppWindowByType } from './AppWindowByType';
import { AppWindowContainer } from './AppWindow.styles';
import { AppWindowResizeHandles } from './AppWindowResizeHandles';
import { Flex } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { getWebViewId } from 'renderer/system/desktop/components/AppWindow/View/getWebViewId';
import {
  denormalizeBounds,
  normalizeBounds,
} from 'os/services/shell/lib/window-manager';
import { TitlebarByType } from './Titlebar/TitlebarByType';
import rgba from 'polished/lib/color/rgba';

const MIN_WIDTH = 500;
const MIN_HEIGHT = 400;

type Props = {
  appWindow: AppWindowType;
};

const AppWindowPresenter = ({ appWindow }: Props) => {
  const { shell, bazaar, theme } = useServices();
  const { textColor, windowColor } = theme.currentTheme;

  const dragControls = useDragControls();
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const appInfo = bazaar.getApp(appWindow.appId);
  const activeWindow = appWindow;
  const borderRadius = appWindow.type === 'dialog' ? 16 : 12;
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

  const resizeBottomRightX = useMotionValue(0);
  const resizeBottomRightY = useMotionValue(0);
  const resizeBottomLeftX = useMotionValue(0);
  const resizeBottomLefty = useMotionValue(0);

  const handleBottomRightCornerResize = useCallback(
    (event: MouseEvent, info: PanInfo) => {
      event.stopPropagation();
      event.preventDefault();
      resizeBottomRightX.set(resizeBottomRightX.get() - info.offset.x);
      resizeBottomRightY.set(resizeBottomRightY.get() - info.offset.y);

      const newWidth = info.point.x - motionX.get();
      const newHeight = info.point.y - motionY.get();
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
    []
  );

  const handleBottomLeftCornerResize = useCallback(
    (event: MouseEvent, info: PanInfo) => {
      event.stopPropagation();
      event.preventDefault();
      resizeBottomLeftX.set(resizeBottomLeftX.get() - info.offset.x);
      resizeBottomLefty.set(resizeBottomLefty.get() - info.offset.y);

      const newWidth = motionX.get() + motionWidth.get() - info.point.x;
      const newHeight = info.point.y - motionY.get();
      const shouldUpdateWidth = newWidth > MIN_WIDTH;
      const shouldUpdateHeight = newHeight > MIN_HEIGHT;

      if (shouldUpdateWidth) {
        motionX.set(info.point.x);
        motionWidth.set(newWidth);
      }
      if (shouldUpdateHeight) {
        motionHeight.set(newHeight);
      }

      if (shouldUpdateWidth || shouldUpdateHeight) updateWindowBounds();
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

  const onDragStart = () => setIsDragging(true);

  const onDragStop = () => {
    setIsDragging(false);
    updateWindowBounds();
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

  const onClose = () =>
    activeWindow.isActive && DesktopActions.closeAppWindow(activeWindow.appId);

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
    console.log('app window mouse down');
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
        display: appWindow.isMinimized ? 'none' : 'block',
        pointerEvents: 'auto',
      }}
      color={textColor}
      customBg={rgba(windowColor, 0.9)}
      onMouseDown={onMouseDown}
      onDragEnter={() => console.log('drag enter')}
      onDrag={() => console.log('drag')}
      onDragOver={(event: any) => {
        event.preventDefault();
        console.log('drag over');
      }}
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
        <AppWindowResizeHandles
          bottomLeft={{
            x: resizeBottomLeftX,
            y: resizeBottomLefty,
          }}
          bottomRight={{
            x: resizeBottomRightX,
            y: resizeBottomRightY,
          }}
          setIsResizing={setIsResizing}
          onDragBottomLeft={handleBottomLeftCornerResize}
          onDragBottomRight={handleBottomRightCornerResize}
        />
      </Flex>
    </AppWindowContainer>
  );
};

export const AppWindow = observer(AppWindowPresenter);

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useMotionValue, useDragControls, PanInfo } from 'framer-motion';
import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { getWebViewId } from 'renderer/system/desktop/components/AppWindow/View/getWebViewId';
import {
  denormalizeBounds,
  normalizeBounds,
} from 'os/services/shell/lib/window-manager';
// import { TitlebarByType } from './Titlebar/TitlebarByType';
import rgba from 'polished/lib/color/rgba';
import { AirliftModelType } from 'os/services/shell/airlift.model';
import { AirliftAgent } from './Airlift.styles';
import { AirliftActions } from 'renderer/logic/actions/airlift';

const MIN_WIDTH = 500;
const MIN_HEIGHT = 400;

type Props = {
  airlift: AirliftModelType;
};

const AirliftPresenter = ({ airlift }: Props) => {
  const { shell, bazaar, theme, spaces } = useServices();
  const { textColor, windowColor } = theme.currentTheme;

  const dragControls = useDragControls();
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const appInfo = bazaar.getApp(airlift.airliftId);
  const borderRadius = airlift.type === 'dialog' ? 16 : 12;
  const denormalizedBounds = useMemo(
    () => denormalizeBounds(airlift.bounds, shell.desktopDimensions),
    [airlift.bounds, shell.desktopDimensions]
  );

  const motionX = useMotionValue(airlift ? denormalizedBounds.x : 20);
  const motionY = useMotionValue(airlift ? denormalizedBounds.y : 20);
  const motionHeight = useMotionValue(
    airlift ? denormalizedBounds.height : 600
  );
  const motionWidth = useMotionValue(airlift ? denormalizedBounds.width : 600);

  useEffect(() => {
    motionX.set(denormalizedBounds.x);
    motionY.set(denormalizedBounds.y);
    motionWidth.set(denormalizedBounds.width);
    motionHeight.set(denormalizedBounds.height);
  }, [airlift.bounds]);

  const windowId = `app-window-${airlift.appId}`;
  const webViewId = getWebViewId(airlift.appId, airlift.type!);

  useEffect(() => {
    const windowEl = document.getElementById(windowId);
    if (windowEl) {
      windowEl.style.zIndex = `${airlift.zIndex}`;
    }
  }, [airlift.zIndex]);

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
      airlift.airliftId,
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
    airlift.airliftId,
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
    const newBounds = await DesktopActions.toggleMaximized(airlift.appId);
    const denormalizedBounds = denormalizeBounds(
      newBounds,
      shell.desktopDimensions
    );
    motionX.set(denormalizedBounds.x);
    motionY.set(denormalizedBounds.y);
    motionWidth.set(denormalizedBounds.width);
    motionHeight.set(denormalizedBounds.height);
  };

  const onMinimize = () => DesktopActions.toggleMinimized(airlift.appId);

  const onClose = () =>
    AirliftActions.removeAirlift(spaces.selected!.path, airlift.airliftId);

  // const onMouseDown = () => AirliftActions.click(spaces.selected!.path, appWindow.appId);

  return (
    <AirliftAgent
      id={windowId}
      dragTransition={{ bounceStiffness: 1000, bounceDamping: 100 }}
      dragElastic={0}
      dragMomentum={false}
      dragListener={false}
      drag={!isResizing}
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
        zIndex: airlift.zIndex,
        borderRadius,
        // display: airlift.isMinimized ? 'none' : 'block',
      }}
      color={textColor}
      customBg={rgba(windowColor, 0.9)}
      // onMouseDown={onMouseDown}
      {...(dragControls
        ? {
            onPointerDown: (e) => {
              dragControls.start(e);
              onDragStart && onDragStart();
            },
            onPointerUp: () => {
              onDragStop && onDragStop();
            },
          }
        : {})}
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
        {/* only for ui airlifts
       <AirliftResizeHandles
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
        />*/}
      </Flex>
    </AirliftAgent>
  );
};

export const Airlift = observer(AirliftPresenter);

import { ReactNode, useCallback } from 'react';
import { ThemeModelType } from 'os/services/theme.model';
import { Flex, Text } from 'renderer/components';
import { WindowIcon } from '../WindowIcon';
import { SharedAvatars } from '../SharedAvatars';
import { AppWindowType } from 'os/services/shell/desktop.model';
import { TitlebarStyle, TitleCentered } from './Titlebar.styles';

type Props = {
  theme: Partial<ThemeModelType>;
  zIndex: number;
  showDevToolsToggle?: boolean;
  hasBorder?: boolean;
  dragControls?: any;
  navigationButtons?: boolean;
  closeButton?: boolean;
  maximizeButton?: boolean;
  minimizeButton?: boolean;
  isAppWindow?: boolean;
  noTitlebar?: boolean;
  shareable?: boolean;
  appWindow: AppWindowType;
  hasBlur?: boolean;
  children?: ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onDevTools?: () => void;
  onDragStop?: (e: any) => void;
  onDragStart?: (e: any) => void;
};

export const Titlebar = ({
  children,
  appWindow,
  showDevToolsToggle,
  closeButton,
  hasBorder = true,
  zIndex = 2,
  noTitlebar,
  isAppWindow,
  dragControls,
  maximizeButton,
  minimizeButton,
  navigationButtons,
  shareable,
  hasBlur,
  theme,
  onClose,
  onMaximize,
  onMinimize,
  onDevTools,
  onDragStop,
  onDragStart,
}: Props) => {
  const onCloseButton = useCallback(
    (evt: any) => {
      evt.stopPropagation();
      // closeDevTools();
      onClose?.();
    },
    [onClose]
  );

  return (
    <TitlebarStyle
      hasBlur={hasBlur}
      {...(dragControls
        ? {
            onPointerDown: (e) => {
              dragControls.start(e);
              onDragStart && onDragStart(e);
            },
            onPointerUp: (e) => {
              onDragStop && onDragStop(e);
            },
          }
        : {})}
      zIndex={zIndex}
      transition={{
        background: { duration: 0.25 },
      }}
      hasBorder={hasBorder!}
      isAppWindow={isAppWindow}
    >
      {appWindow && !noTitlebar && (
        <TitleCentered justifyContent="center" flex={1}>
          <Flex gap={4} alignItems="center">
            <Flex justifyContent="center" alignItems="center">
              <Text
                opacity={0.7}
                style={{ textTransform: 'capitalize', userSelect: 'none' }}
                fontSize={2}
                fontWeight={500}
              >
                {appWindow.title}
              </Text>
            </Flex>
          </Flex>
        </TitleCentered>
      )}
      {shareable || navigationButtons || showDevToolsToggle ? (
        <Flex ml="2px" zIndex={zIndex + 1} gap={4} alignItems="center">
          {shareable && (
            <SharedAvatars
              iconColor={theme.iconColor!}
              backgroundColor={theme.windowColor}
            />
          )}
          {showDevToolsToggle && (
            <WindowIcon
              icon="DevBox"
              iconColor={theme.iconColor!}
              bg="#97A3B2"
              onClick={(evt: any) => {
                evt.stopPropagation();
                onDevTools && onDevTools();
              }}
            />
          )}
          {navigationButtons && (
            <>
              <WindowIcon
                icon="ArrowLeftLine"
                iconColor={theme.iconColor!}
                bg="#97A3B2"
                onClick={() => {}}
              />
              <WindowIcon
                icon="ArrowRightLine"
                iconColor={theme.iconColor!}
                bg="#97A3B2"
                onClick={() => {}}
              />
            </>
          )}
        </Flex>
      ) : (
        isAppWindow && <Flex />
      )}
      {children}
      {(maximizeButton || closeButton || minimizeButton) && (
        <Flex gap={4} alignItems="center">
          {minimizeButton && (
            <WindowIcon
              icon="Minimize"
              iconColor={theme.iconColor!}
              bg="#97A3B2"
              onClick={(evt: any) => {
                evt.stopPropagation();
                onMinimize && onMinimize();
              }}
            />
          )}
          {maximizeButton && (
            <WindowIcon
              icon="Expand"
              iconColor={theme.iconColor!}
              bg="#97A3B2"
              onClick={(evt: any) => {
                evt.stopPropagation();
                onMaximize && onMaximize();
              }}
            />
          )}
          {closeButton && (
            <WindowIcon
              icon="Close"
              iconColor={theme.iconColor!}
              bg="#FF6240"
              fillWithBg
              onClick={onCloseButton}
            />
          )}
        </Flex>
      )}
    </TitlebarStyle>
  );
};

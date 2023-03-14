import { ReactNode, PointerEvent } from 'react';
import { ThemeModelType } from 'os/services/theme.model';
import { Flex, Text } from 'renderer/components';
import { AppWindowIcon } from '../AppWindowIcon';
import { SharedAvatars } from './SharedAvatars';
import { AppWindowType } from 'os/services/shell/desktop.model';
import { TitlebarContainer, TitleCentered } from './Titlebar.styles';
import { useDoubleClick } from 'renderer/logic/lib/useDoubleClick';

type Props = {
  theme: Partial<ThemeModelType>;
  zIndex: number;
  showDevToolsToggle?: boolean;
  hasBorder?: boolean;
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
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onDevTools: () => void;
  onDragEnd: () => void;
  onDragStart: (e: PointerEvent<HTMLDivElement>) => void;
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
  onDragEnd,
  onDragStart,
}: Props) => {
  const onDoubleClick = useDoubleClick(onMaximize);
  const iconColor = theme.iconColor ?? '#333333';

  return (
    <TitlebarContainer
      hasBlur={hasBlur}
      onPointerDown={onDragStart}
      onPointerUp={onDragEnd}
      zIndex={zIndex}
      transition={{
        background: { duration: 0.25 },
      }}
      hasBorder={hasBorder}
      isAppWindow={isAppWindow}
    >
      {appWindow && !noTitlebar && (
        <TitleCentered justifyContent="center" flex={1} onClick={onDoubleClick}>
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
              iconColor={iconColor}
              backgroundColor={theme.windowColor}
            />
          )}
          {showDevToolsToggle && (
            <AppWindowIcon
              icon="DevBox"
              iconColor={iconColor}
              bg="#97A3B2"
              onClick={(evt: any) => {
                evt.stopPropagation();
                onDevTools && onDevTools();
              }}
            />
          )}
          {navigationButtons && (
            <>
              <AppWindowIcon
                icon="ArrowLeftLine"
                iconColor={iconColor}
                bg="#97A3B2"
                onClick={() => {}}
              />
              <AppWindowIcon
                icon="ArrowRightLine"
                iconColor={iconColor}
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
            <AppWindowIcon
              icon="Minimize"
              iconColor={iconColor}
              bg="#97A3B2"
              onClick={(evt: any) => {
                evt.stopPropagation();
                onMinimize?.();
              }}
            />
          )}
          {maximizeButton && (
            <AppWindowIcon
              icon="Expand"
              iconColor={iconColor}
              bg="#97A3B2"
              onClick={(evt: any) => {
                evt.stopPropagation();
                onMaximize?.();
              }}
            />
          )}
          {closeButton && (
            <AppWindowIcon
              icon="Close"
              iconColor={iconColor}
              bg="#FF6240"
              fillWithBg
              onClick={(evt) => {
                evt.stopPropagation();
                // closeDevTools();
                onClose?.();
              }}
            />
          )}
        </Flex>
      )}
    </TitlebarContainer>
  );
};

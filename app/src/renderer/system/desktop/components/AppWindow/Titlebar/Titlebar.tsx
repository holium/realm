import { ReactNode, PointerEvent } from 'react';
import { Text, Flex } from '@holium/design-system';
import { AppWindowIcon } from '../AppWindowIcon';
import { SharedAvatars } from './SharedAvatars';
import { AppWindowType } from 'os/services/shell/desktop.model';
import { TitlebarContainer, TitleCentered } from './Titlebar.styles';
import { useDoubleClick } from 'renderer/logic/lib/useDoubleClick';

type Props = {
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
  onClose,
  onMaximize,
  onMinimize,
  onDevTools,
  onDragEnd,
  onDragStart,
}: Props) => {
  const onDoubleClick = useDoubleClick(onMaximize);

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
              <Text.Custom
                opacity={0.7}
                style={{ textTransform: 'capitalize', userSelect: 'none' }}
                fontSize={2}
                fontWeight={500}
              >
                {appWindow.title}
              </Text.Custom>
            </Flex>
          </Flex>
        </TitleCentered>
      )}
      {shareable || navigationButtons || showDevToolsToggle ? (
        <Flex ml="2px" zIndex={zIndex + 1} gap={4} alignItems="center">
          {/* {shareable && (
            <SharedAvatars
              iconColor={iconColor}
              backgroundColor={theme.windowColor}
            />
          )} */}
          {showDevToolsToggle && (
            <AppWindowIcon
              icon="DevBox"
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
                bg="#97A3B2"
                onClick={() => {}}
              />
              <AppWindowIcon
                icon="ArrowRightLine"
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
              bg="#97A3B2"
              onClick={(evt: any) => {
                evt.stopPropagation();
                onMinimize();
              }}
            />
          )}
          {maximizeButton && (
            <AppWindowIcon
              icon="Expand"
              bg="#97A3B2"
              onClick={(evt: any) => {
                evt.stopPropagation();
                onMaximize();
              }}
            />
          )}
          {closeButton && (
            <AppWindowIcon
              icon="Close"
              bg="#FF6240"
              onClick={(evt) => {
                evt.stopPropagation();
                console.log('closign');
                // closeDevTools();
                onClose();
              }}
            />
          )}
        </Flex>
      )}
    </TitlebarContainer>
  );
};

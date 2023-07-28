import { PointerEvent, ReactNode } from 'react';

import { Flex, Text } from '@holium/design-system/general';

import { AppWindowIcon } from '../AppWindowIcon';
import { TitlebarContainer, TitleCentered } from './Titlebar.styles';

type Props = {
  zIndex: number;
  title?: string;
  isNative: boolean;
  showDevToolsToggle?: boolean;
  hasBorder?: boolean;
  navigationButtons?: boolean;
  closeButton?: boolean;
  maximizeButton?: boolean;
  minimizeButton?: boolean;
  isAppWindow?: boolean;
  shareable?: boolean;
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
  title,
  isNative,
  showDevToolsToggle,
  closeButton,
  hasBorder = true,
  zIndex = 2,
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
  // const onDoubleClick = useDoubleClick(onMaximize);

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
      {title && (
        <TitleCentered
          justifyContent="center"
          flex={1}
          // onClick={onDoubleClick}
        >
          <Flex gap={4} alignItems="center">
            <Flex justifyContent="center" alignItems="center">
              <Text.Custom
                opacity={0.7}
                style={{ textTransform: 'capitalize', userSelect: 'none' }}
                fontSize={2}
                fontWeight={500}
              >
                {title}
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
          {showDevToolsToggle && !isNative && (
            <AppWindowIcon
              icon="DevBox"
              onClick={(evt: any) => {
                evt.stopPropagation();
                onDevTools && onDevTools();
              }}
            />
          )}
          {navigationButtons && (
            <>
              <AppWindowIcon icon="ArrowLeftLine" onClick={() => {}} />
              <AppWindowIcon icon="ArrowRightLine" onClick={() => {}} />
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
              onClick={(evt: any) => {
                evt.stopPropagation();
                onMinimize();
              }}
            />
          )}
          {maximizeButton && (
            <AppWindowIcon
              icon="Expand"
              onClick={(evt: any) => {
                evt.stopPropagation();
                onMaximize();
              }}
            />
          )}
          {closeButton && (
            <AppWindowIcon
              icon="Close"
              iconColor="intent-alert"
              onClick={(evt) => {
                evt.stopPropagation();
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

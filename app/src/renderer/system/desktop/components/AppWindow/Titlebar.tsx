import { useCallback } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { ThemeModelType } from 'os/services/theme.model';
import { Flex, Text } from 'renderer/components';
import { WindowIcon } from './WindowIcon';
import { SharedAvatars } from './SharedAvatars';
import { AppWindowType } from 'os/services/shell/desktop.model';

interface TitlebarStyleProps {
  hasBorder: boolean;
  zIndex: number;
  isAppWindow?: boolean;
  hasBlur?: boolean;
}

export const TitlebarStyle = styled(motion.div)<TitlebarStyleProps>`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  position: ${(props: TitlebarStyleProps) =>
    props.isAppWindow ? 'relative' : 'absolute'};
  /* backdrop-filter: ${(props: TitlebarStyleProps) =>
    props.hasBlur ? 'blur(16px)' : 'none'}; */
  top: 0;
  left: 0;
  right: 0;
  height: ${(props: TitlebarStyleProps) => (props.isAppWindow ? 30 : 54)}px;
  padding: 0 4px 0
    ${(props: TitlebarStyleProps) => (props.isAppWindow ? 4 : 0)}px;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  ${(props: TitlebarStyleProps) => css`
    z-index: ${props.zIndex};
    border-bottom: ${props.hasBorder
      ? ' 1px solid var(--rlm-border-color)'
      : 'none'};
  `}
`;

const TitleCentered = styled(Flex)`
  position: absolute;
  height: 30px;
  left: 0;
  right: 0;
  text-align: center;
`;

interface TitlebarProps {
  theme: Partial<ThemeModelType>;
  zIndex: number;
  showDevToolsToggle?: boolean;
  hasBorder?: boolean;
  dragControls?: any;
  onDragStop?: (e: any) => void;
  onDragStart?: (e: any) => void;
  navigationButtons?: boolean;
  closeButton?: boolean;
  onClose?: () => void;
  maximizeButton?: boolean;
  minimizeButton?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onDevTools?: () => void;
  isAppWindow?: boolean;
  noTitlebar?: boolean;
  shareable?: boolean;
  appWindow: AppWindowType;
  hasBlur?: boolean;
  children?: React.ReactNode;
}

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
  onDragStop,
  onDragStart,
  onClose,
  onDevTools,
  maximizeButton,
  minimizeButton,
  onMaximize,
  onMinimize,
  navigationButtons,
  shareable,
  hasBlur,
  theme,
}: TitlebarProps) => {
  let titleSection: any;
  if (appWindow) {
    titleSection = (
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
    );
  }

  const onCloseButton = useCallback(
    (evt: any) => {
      evt.stopPropagation();
      // closeDevTools();
      onClose && onClose();
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
      {titleSection && !noTitlebar && (
        <TitleCentered justifyContent="center" flex={1}>
          {titleSection}
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
        isAppWindow && <Flex></Flex>
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

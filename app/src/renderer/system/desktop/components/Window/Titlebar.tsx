import { FC } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { rgba, darken } from 'polished';

import { ThemeModelType } from 'os/services/shell/theme.model';
import { Flex, Text } from 'renderer/components';
import { WindowIcon } from './WindowIcon';
import { SharedAvatars } from './SharedAvatars';
import { useCallback } from 'react';

type TitlebarStyleProps = {
  customBg: string;
  hasBorder: boolean;
  zIndex: number;
  isAppWindow?: boolean;
  hasBlur?: boolean;
};

export const TitlebarStyle = styled(motion.div)<TitlebarStyleProps>`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  position: ${(props: TitlebarStyleProps) =>
    props.isAppWindow ? 'relative' : 'absolute'};
  backdrop-filter: ${(props: TitlebarStyleProps) =>
    props.hasBlur ? 'blur(16px)' : 'none'};
  top: 0;
  left: 0;
  right: 0;
  height: ${(props: TitlebarStyleProps) => (props.isAppWindow ? 30 : 50)}px;
  padding: 0 4px 0
    ${(props: TitlebarStyleProps) => (props.isAppWindow ? 4 : 0)}px;
  --webkit-transform: translate3d(0, 0, 0);
  --webkit-transform: translateZ(0);
  --webkit-backface-visibility: hidden;
  --webkit-perspective: 1000;
  will-change: transform;
  ${(props: TitlebarStyleProps) => css`
    background: ${props.customBg};
    z-index: ${props.zIndex};
    border-bottom: ${props.hasBorder
      ? `1px solid ${rgba(darken(0.5, props.customBg), 0.25)}`
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

type TitlebarProps = {
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
  onMaximize?: () => void;
  onDevTools?: () => void;
  isAppWindow?: boolean;
  noTitlebar?: boolean;
  shareable?: boolean;
  app?: {
    id?: string;
    title?: string;
    icon?: string;
    color?: string;
  };
  hasBlur?: boolean;
  children?: React.ReactNode;
};

export const Titlebar: FC<TitlebarProps> = (props: TitlebarProps) => {
  const {
    children,
    showDevToolsToggle,
    closeButton,
    hasBorder,
    zIndex,
    noTitlebar,
    isAppWindow,
    dragControls,
    onDragStop,
    onDragStart,
    onClose,
    onDevTools,
    maximizeButton,
    onMaximize,
    navigationButtons,
    shareable,
    hasBlur,
  } = props;
  const { windowColor, iconColor } = props.theme;

  let titleSection: any;
  if (props.app) {
    const { title, icon } = props.app!;
    titleSection = (
      <Flex gap={4} alignItems="center">
        <Flex justifyContent="center" alignItems="center">
          {icon && <img height={24} width={24} src={icon} />}
          <Text
            opacity={0.7}
            style={{ textTransform: 'capitalize' }}
            fontSize={2}
            fontWeight={500}
          >
            {title}
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
      customBg={windowColor!}
      hasBorder={hasBorder!}
      isAppWindow={isAppWindow}
    >
      {titleSection && !noTitlebar && (
        <TitleCentered justifyContent="center" flex={1}>
          {titleSection}
        </TitleCentered>
      )}
      {shareable || navigationButtons ? (
        <Flex zIndex={zIndex + 1} gap={4} alignItems="center">
          {shareable && (
            <SharedAvatars
              iconColor={iconColor!}
              backgroundColor={windowColor}
            />
          )}
          {navigationButtons && (
            <>
              <WindowIcon
                icon="ArrowLeftLine"
                iconColor={iconColor!}
                bg="#97A3B2"
                onClick={() => {}}
              />
              <WindowIcon
                icon="ArrowRightLine"
                iconColor={iconColor!}
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
      {(maximizeButton || closeButton) && (
        <Flex gap={4} alignItems="center">
          {showDevToolsToggle && (
            <WindowIcon
              icon="DevBox"
              iconColor={iconColor!}
              bg="#97A3B2"
              onClick={(evt: any) => {
                evt.stopPropagation();
                onDevTools && onDevTools();
              }}
            />
          )}
          {maximizeButton && (
            <WindowIcon
              icon="Expand"
              iconColor={iconColor!}
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
              iconColor={iconColor!}
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

Titlebar.defaultProps = {
  zIndex: 2,
  hasBorder: true,
  showDevToolsToggle: true,
};

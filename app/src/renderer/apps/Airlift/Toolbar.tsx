import { FC } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { rgba, darken } from 'polished';

import { ThemeModelType } from 'os/services/theme.model';
import { Flex, Text, Input } from 'renderer/components';
import { useCallback } from 'react';

type AirliftToolbarStyleProps = {
  customBg: string;
  hasBorder: boolean;
  zIndex: number;
  isAppWindow?: boolean;
  hasBlur?: boolean;
};

export const AirliftToolbarStyle = styled(motion.div)<AirliftToolbarStyleProps>`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: left;
  position: ${(props: AirliftToolbarStyleProps) =>
    props.isAppWindow ? 'relative' : 'absolute'};
  backdrop-filter: ${(props: AirliftToolbarStyleProps) =>
    props.hasBlur ? 'blur(16px)' : 'none'};
  top: 0;
  left: 0;
  right: 0;
  height: ${(props: AirliftToolbarStyleProps) => (props.isAppWindow ? 30 : 54)}px;
  padding: 0 4px 0
    ${(props: AirliftToolbarStyleProps) => (props.isAppWindow ? 4 : 0)}px;
  --webkit-transform: translate3d(0, 0, 0);
  --webkit-transform: translateZ(0);
  --webkit-backface-visibility: hidden;
  --webkit-perspective: 1000;
  will-change: transform;
  ${(props: AirliftToolbarStyleProps) => css`
    z-index: ${props.zIndex};
    border-bottom: ${props.hasBorder
      ? `1px solid ${rgba(darken(0.5, props.customBg), 0.25)}`
      : 'none'};
  `}
`;

const TitleCentered = styled(Flex)`
  text-align: left;
`;

export type AirliftToolbarProps = {
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

export const AirliftToolbar: FC<AirliftToolbarProps> = (props: AirliftToolbarProps) => {
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
    // const { title, icon } = props.app!;
    titleSection = (
      <Flex gap={4} alignItems="center">
        <Flex flexDirection="row" justifyContent="center" alignItems="left" >
          <Text
            opacity={0.7}
//            style={{ textTransform: 'capitalize' }}
            fontSize={2}
            fontWeight={500}
          >
            %
          </Text>
          <Input opacity={0.7} fontSize={2} fontWeight={500} small={true}></Input>
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
    <AirliftToolbarStyle
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
      customBg={rgba(windowColor!, 0.9)}
      hasBorder={hasBorder!}
      isAppWindow={isAppWindow}
    >
      {titleSection && !noTitlebar && (
        <TitleCentered justifyContent="left" flex={1}>
          {titleSection}
        </TitleCentered>
      )}
      {shareable || navigationButtons ? (
        <Flex zIndex={zIndex + 1} gap={4} alignItems="center">
        </Flex>
      ) : (
        isAppWindow && <Flex></Flex>
      )}
      {children}
      {(maximizeButton || closeButton) && (
        <Flex gap={4} alignItems="center">
        </Flex>
      )}
    </AirliftToolbarStyle>
  );
};

AirliftToolbar.defaultProps = {
  zIndex: 2,
  hasBorder: true,
  showDevToolsToggle: true,
};

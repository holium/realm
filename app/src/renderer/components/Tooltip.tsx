import { CSSProperties, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { compose, space, color, typography } from 'styled-system';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, Box, MenuOrientation } from './index';
import { Portal } from 'renderer/system/dialog/Portal';

export interface TooltipProps {
  id: string;
  delay?: number;
  style?: CSSProperties;
  placement?: MenuOrientation;
  content?: React.ReactNode | string;
  children: React.ReactNode;
  position?: any;
  show?: boolean;
}

const margin = 2;

const placementMaps: Record<MenuOrientation, any> = {
  bottom: css`
    margin-top: ${margin}px;
    top: 100%;
    left: 50%;
    transform: translate(-50%, 0);
  `,
  'bottom-right': css`
    top: 100%;
    left: 100%;
  `,
  'bottom-left': css`
    top: 100%;
    right: 100%;
  `,
  top: css`
    margin-bottom: ${margin}px;
    bottom: 100%;
    left: 50%;
    transform: translate(-50%, 0);
  `,
  'top-right': css`
    bottom: 100%;
    left: 100%;
  `,
  'top-left': css`
    bottom: 100%;
    right: 100%;
  `,
  left: css`
    margin-right: ${margin}px;
    bottom: 50%;
    right: 100%;
    transform: translate(0, 50%);
  `,
  right: css`
    margin-left: ${margin}px;
    bottom: 50%;
    left: 100%;
    transform: translate(0, 50%);
  `,
  pointer: css``,
};

interface TooltipStyleProps {
  placement: MenuOrientation;
}

export const TooltipStyle = styled(
  styled.div<TooltipStyleProps>`
    // position: absolute;
    display: inline-flex;
    flex-direction: column;
    width: max-content;
    height: max-content;
    overflow: hidden;
    color: ${(props) => props.theme.colors.text.primary};
    box-shadow: ${(props) => props.theme.elevations.one};
    ${(props) => placementMaps[props.placement]};
  `
)(compose(space, color, typography));

const Wrapper = styled(motion.div)<{ coords: any }>`
  ${({ coords }) => css`
    left: ${coords.left}px;
    top: ${coords.top}px;
  `}
  box-sizing: border-box;
  position: absolute;
`;
// // Parent wrapper
export const TooltipWrapper = styled(styled.div<Partial<TooltipProps>>`
  position: relative;
  z-index: 4;

  ${TooltipStyle} {
    transition: 0.2s all;
    visibility: hidden;
  }
  &:hover {
    ${TooltipStyle} {
      transition-delay: ${(props: Partial<TooltipProps>) => props.delay}s;
      visibility: visible;
    }
  }
`)(compose(space, color, typography));

const baseMotionProps = {
  variants: {
    active: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        delay: 1,
        ease: 'easeOut',
      },
    },
    inactive: {
      opacity: 0,
      y: 4,
      transition: {
        duration: 0.1,
      },
    },
  },
  initial: 'inactive',
  animate: 'active',
  exit: 'inactive',
};

export const Tooltip = ({
  id,
  style,
  content,
  delay = 0.5,
  placement = 'bottom-right',
  children,
  show,
  ...rest
}: TooltipProps) => {
  const tooltipRef = useRef(null);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const [isVisible, setIsVisible] = useState(false);
  let body = content;

  if (typeof content === 'string') {
    body = (
      <Card borderRadius={4} style={{ fontSize: 14 }} padding="4px">
        {content}
      </Card>
    );
  }
  return (
    <TooltipWrapper delay={delay} ref={tooltipRef} style={style}>
      <Portal>
        {isVisible && (
          <AnimatePresence>
            <Wrapper
              key={`${id}-tooltip`}
              coords={coords}
              {...rest}
              {...baseMotionProps}
            >
              <TooltipStyle
                style={{ left: coords.left, top: coords.top }}
                placement={placement}
              >
                {body}
              </TooltipStyle>
            </Wrapper>
          </AnimatePresence>
        )}
      </Portal>
      <Box
        onMouseDown={(evt: any) => {
          setIsVisible(false);
          evt.stopPropagation();
        }}
        onMouseEnter={(evt: any) => {
          const rect = evt.target.getBoundingClientRect();
          setCoords({
            left: rect.x,
            top: rect.top - rect.height,
          });
          evt.stopPropagation();
          show && setIsVisible(true);
        }}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </Box>
    </TooltipWrapper>
  );
};

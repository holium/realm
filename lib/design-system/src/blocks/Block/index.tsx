import { motion } from 'framer-motion';
import { FC } from 'react';
import styled, { css } from 'styled-components';
import { BoxProps } from '../..';

type BlockMode = 'embed' | 'display';

type StyleProps = { mode?: BlockMode } & BoxProps;

const BlockStyle = styled(motion.div)<StyleProps>`
  display: inline-flex;
  flex-direction: column;
  box-sizing: content-box;
  align-items: flex-start;
  padding: 6px;
  gap: 6px;
  background: rgba(241, 241, 245, 0.8);
  backdrop-filter: blur(6px);
  border-radius: var(--rlm-border-radius-9);
  border: 1px solid transparent;
  width: ${(props) => `${props.width}px`};
  ${(props) =>
    props.mode === 'display' &&
    css`
      box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
    `}
  .block-author {
    transition: var(--transition);
    opacity: 0;
  }
  &:hover {
    .block-author {
      transition: var(--transition);
      opacity: 0.5;
    }
  }
`;

export type BlockProps = {
  id: string;
  draggable?: boolean;
} & StyleProps;

export const Block: FC<BlockProps> = (props: BlockProps) => {
  const { id, mode = 'embed', draggable = false, children, ...rest } = props;

  return (
    <BlockStyle
      id={id}
      mode={mode}
      width={rest.width || 'inherit'}
      {...(draggable && {
        drag: true,
        dragTransition: { bounceStiffness: 600, bounceDamping: 20 },
        dragMomentum: false,
        whileTap: { cursor: 'grabbing' },
      })}

      // dragConstraints={{ left: 0, right: 300 }}
      // transition={{ scale: 0.2 }}
      // whileDrag={{ scale: 1.2 }}
      // whileTap={{ scale: 0.98, transition: { scale: 0.2 }, userSelect: 'none' }}
    >
      {children}
    </BlockStyle>
  );
};

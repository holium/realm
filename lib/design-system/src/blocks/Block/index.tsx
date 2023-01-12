import { motion } from 'framer-motion';
import { FC } from 'react';
import styled, { css } from 'styled-components';
import { BoxProps } from '../..';

type BlockMode = 'embed' | 'display';

type StyleProps = { mode?: BlockMode } & BoxProps;

const BlockStyle = styled(motion.div)<StyleProps>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 6px;
  gap: 6px;
  background: rgba(241, 241, 245, 0.8);
  backdrop-filter: blur(6px);
  border-radius: var(--rlm-border-radius-9);
  ${(props) =>
    props.mode === 'display' &&
    css`
      box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
    `}
`;

export type BlockProps = {
  id: string;
} & StyleProps;

export const Block: FC<BlockProps> = (props: BlockProps) => {
  const { id, mode = 'embed', children } = props;

  return (
    <BlockStyle id={id} mode={mode}>
      {children}
    </BlockStyle>
  );
};

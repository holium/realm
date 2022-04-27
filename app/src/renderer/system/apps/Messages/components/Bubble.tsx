import styled from 'styled-components';
import { rgba, lighten } from 'polished';
import { motion } from 'framer-motion';
import { ThemeType } from '../../../../theme';

type BubbleProps = {
  theme: ThemeType;
  customBg?: string;
};

export const Bubble = styled(motion.div)`
  max-width: calc(100% - 40px);
  background: ${(props: BubbleProps) =>
    props.customBg
      ? rgba(lighten(0.13, props.customBg), 0.5)
      : props.theme.colors.bg.blendedBg};
  border-radius: 9px;

  &.text {
    padding: 8px;
    line-height: 16px;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    user-select: text;
  }
  &.image {
    img {
      display: block;
      max-width: calc(100% - 12px);
      max-height: calc(100% - 12px);
      height: auto;
      border-radius: inherit;
    }
  }
  &.typing {
    padding: 8px;
  }
  p {
    margin: 0;
  }
`;

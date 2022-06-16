import styled, { css } from 'styled-components';
import {
  compose,
  color,
  backgroundColor,
  BackgroundColorProps,
  ColorProps,
} from 'styled-system';
import { rgba, lighten } from 'polished';
import { motion } from 'framer-motion';
import { ThemeType } from '../../../theme';

type BubbleProps = {
  theme: ThemeType;
  customBg?: string;
  primary: boolean;
} & BackgroundColorProps &
  ColorProps;

export const Bubble = styled(motion.div)<BubbleProps>`
  max-width: calc(100% - 40px);
  box-sizing: none;
  background: ${(props: BubbleProps) =>
    props.customBg || props.theme.colors.bg.blendedBg};
  border-radius: 12px;
  ${(props: BubbleProps) =>
    props.primary
      ? css`
          border-bottom-right-radius: 0px;
        `
      : css`
          border-bottom-left-radius: 0px;
        `}

  padding: 8px;
  line-height: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  user-select: text;

  img {
    display: block;
    margin-bottom: 8px;
    // max-width: calc(100% - 12px);
    // max-height: 300px;
    height: auto;
    border-radius: inherit;
  }

  &.typing {
    padding: 8px;
  }
  p {
    margin: 0;
  }
  ${compose(color, backgroundColor)}
`;

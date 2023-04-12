import styled, { css } from 'styled-components';
import {
  compose,
  color,
  backgroundColor,
  BackgroundColorProps,
  ColorProps,
} from 'styled-system';
import { motion } from 'framer-motion';
import { ThemeType } from '../../../theme';

type BubbleProps = {
  theme: ThemeType;
  customBg?: string;
  primary: boolean;
} & BackgroundColorProps &
  ColorProps;

export const Bubble = styled(motion.div)<BubbleProps>`
  max-width: calc(100% - 10px);
  box-sizing: content-box;
  background: ${(props: BubbleProps) =>
    props.customBg || props.theme.colors.bg.blendedBg};
  border-radius: 19px;
  ${(props: BubbleProps) =>
    props.primary
      ? css`
          * {
            color: #fff;
          }
          border-bottom-right-radius: 0px;
        `
      : css`
          border-top-left-radius: 0px;
        `}

  padding: 8px 12px;
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
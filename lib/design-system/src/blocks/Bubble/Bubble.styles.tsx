import styled from 'styled-components';

import { Box, BoxProps, Flex, Icon, Text } from '../../../general';
import { BlockStyle } from '../../blocks/Block/Block';
import { BUBBLE_HEIGHT, BUBBLE_WIDTH } from './Bubble.constants';

type BubbleContainerProps = {
  isOur: boolean;
};

export const BubbleContainer = styled(Flex)<BubbleContainerProps>`
  position: relative;
  justify-content: ${({ isOur }) => (isOur ? 'flex-end' : 'flex-start')};
`;

export type BubbleStyleProps = {
  isPrevGrouped?: boolean;
  isNextGrouped?: boolean;
  ourTextColor?: string;
} & BoxProps;

export const BubbleStyle = styled(Box)<BubbleStyleProps>`
  display: inline-flex;
  flex-direction: column;
  width: auto;
  user-select: text;
  font-size: 14px;
  align-self: flex-start;
  box-sizing: border-box;
  padding: ${BUBBLE_HEIGHT.rem.paddingY} ${BUBBLE_WIDTH.rem.paddingX};
  min-width: 150px;
  max-width: min(90%, 450px);
  color: rgba(var(--rlm-text-rgba));
  background: rgba(var(--rlm-card-rgba));
  border-radius: ${(props) => {
    if (props.isPrevGrouped && props.isNextGrouped) {
      return '0px 12px 12px 0px';
    }
    if (props.isPrevGrouped) {
      return '0px 12px 12px 12px';
    }
    return '12px 12px 12px 0px';
  }};
  transition: width 1s ease-in-out;
  &.bubble-our {
    background: rgba(var(--rlm-intent-caution-rgba));
    border-radius: ${(props) => {
      if (props.isPrevGrouped && props.isNextGrouped) {
        return '12px 0px 0px 12px';
      }
      if (props.isPrevGrouped) {
        return '12px 0px 12px 12px';
      }
      if (props.isNextGrouped) {
        return '12px 12px 0px 12px';
      }
      return '12px 12px 0px 12px';
    }} !important;

    ${Text.Custom} {
      color: ${(props) => {
        if (props.ourTextColor) {
          return props.ourTextColor;
        }
        return '#ffffff';
      }} !important;
    }
    ${Icon} {
      line-height: 1.1;
      fill: #ffffff !important;
    }
    .fragment-blockquote {
      color: ${(props) => {
        if (props.ourTextColor) {
          return props.ourTextColor;
        }
        return '#ffffff';
      }};
      background: rgba(0, 0, 0, 0.08) !important;
      &:hover {
        background: rgba(0, 0, 0, 0.12) !important;
      }
      border-left: 2px solid
        ${(props) => {
          if (props.ourTextColor) {
            return props.ourTextColor;
          }
          return '#ffffff';
        }}70;
    }
    .code-wrapper {
      background-color: rgba(0, 0, 0, 0.12);
      &:hover {
        transition: var(--transition);
        background-color: rgba(0, 0, 0, 0.15);
      }
    }
    .fragment-ship {
      background: ${(props) => {
        if (props.ourTextColor && props.ourTextColor === '#000000') {
          return '#00000015';
        }
        return '#ffffff30';
      }};
      &:hover {
        background: ${(props) => {
          if (props.ourTextColor && props.ourTextColor === '#000000') {
            return '#00000025';
          }
          return '#ffffff45';
        }};
      }
    }
    .block-wrapper {
      a {
        color: #ffffff !important;
      }
    }
    ${BlockStyle} {
      backdrop-filter: brightness(75%) blur(6px);
      transition: var(--transition);

      &:hover {
        transition: var(--transition);
        background: rgba(0, 0, 0, 0.1);
      }
    }
  }

  .bubble-reactions {
    transition: var(--transition);
    opacity: 0;
  }
  &:hover {
    .bubble-reactions {
      transition: var(--transition);
      opacity: 1;
    }
  }
  &.bubble-our {
    .bubble-reactions {
      transition: var(--transition);
      opacity: 0;
    }
  }

  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.2);

  * {
    box-sizing: border-box;
  }
`;

export const BubbleAuthor = styled(Text.Custom)<{ authorColor?: string }>`
  display: inline-block;
  margin-top: -2px;
  line-height: ${BUBBLE_HEIGHT.rem.authorHeight};
  font-size: 12px;
  font-weight: 500;
  user-select: text;
  color: ${(props) => props.authorColor ?? 'rgba(var(--rlm-text-rgba))'};
`;

export const BubbleFooter = styled(Box)`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  user-select: text;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  max-width: 100%;
  font-size: 12px;
`;

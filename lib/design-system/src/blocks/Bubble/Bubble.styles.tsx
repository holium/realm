import styled from 'styled-components';
import { Text, Box } from '../..';
import { BlockStyle } from '../Block/Block';
import { FragmentBlockquote, FragmentShip, BlockWrapper } from './fragment-lib';

export const BubbleStyle = styled(Box)`
  display: inline-flex;
  flex-direction: column;
  width: auto;
  padding: 8px;
  user-select: text;
  font-size: 14px;
  align-self: flex-start;
  box-sizing: border-box;
  min-width: 150px;
  max-width: 100%;
  color: var(--rlm-text-color);
  background: var(--rlm-input-color);
  border-radius: 9px 9px 9px 0px;
  transition: width 1s ease-in-out;
  &.bubble-our {
    background: var(--rlm-intent-caution-color);
    border-radius: 12px 12px 0px 12px !important;
    ${Text.Custom} {
      color: #ffffff !important;
    }
    ${FragmentBlockquote} {
      color: #ffffff;
      border-left: 2px solid #ffffff70;
    }
    ${FragmentShip} {
      background: #ffffff30;
      &:hover {
        background: #ffffff45;
      }
    }
    ${BlockWrapper} {
      a {
        color: #ffffff !important;
      }
    }
    ${BlockStyle} {
      backdrop-filter: brightness(80%) blur(6px);
      transition: var(--transition);

      &:hover {
        transition: var(--transition);
        background: var(--rlm-overlay-active);
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
`;

export const BubbleAuthor = styled(Text.Custom)<{ authorColor?: string }>`
  display: inline-block;
  margin-top: -2px;
  line-height: 1.2rem;
  font-size: 12px;
  font-weight: 500;
  user-select: text;
  color: ${(props) => props.authorColor ?? 'var(--rlm-text-color)'};
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

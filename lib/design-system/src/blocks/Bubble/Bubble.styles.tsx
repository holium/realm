import styled from 'styled-components';
import { Text, Box } from '../..';
import { FragmentBlockquote, FragmentShip } from './fragment-lib';

export const BubbleStyle = styled(Box)`
  display: inline-flex;
  flex-direction: column;
  width: auto;
  gap: 2px;
  padding: 6px 8px 6px 8px;
  font-size: 14px;
  align-self: flex-start;
  min-width: 150px;
  color: var(--rlm-text-color);
  background: var(--rlm-input-color);
  border-radius: 9px 9px 9px 0px;
  &.bubble-our {
    background: var(--rlm-accent-color);
    border-radius: 9px 9px 0px 9px !important;
    ${Text.Custom} {
      color: #ffffff;
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

export const BubbleAuthor = styled(Text.Custom) <{ authorColor?: string }>`
  display: inline-flex;
  font-size: 12px;
  font-weight: 500;
  color: ${(props) => props.authorColor ?? 'var(--rlm-text-color)'};
`;

export const BubbleFooter = styled(Box)`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
  font-size: 12px;
`;

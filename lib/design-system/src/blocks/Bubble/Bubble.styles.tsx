import styled, { css } from 'styled-components';
import { Text, Box } from '../..';

export const BubbleStyle = styled(Box)<{ our?: boolean }>`
  display: inline-flex;
  flex-direction: column;
  width: auto;
  gap: 2px;
  padding: 6px 8px 6px 8px;
  font-size: 14px;
  align-self: flex-start;
  ${(props) =>
    props.our
      ? css`
          background: var(--rlm-accent-color);
          border-radius: 9px 9px 0px 9px;
          ${Text.Custom} {
            color: #ffffff;
          }
        `
      : css`
          color: var(--rlm-text-color);
          background: var(--rlm-input-color);
          border-radius: 9px 9px 9px 0px;
        `};

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

  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.2);
`;

export const BubbleAuthor = styled(Text.Custom)<{ authorColor: string }>`
  display: inline-flex;
  font-size: 12px;
  font-weight: 500;
  color: ${(props) => props.authorColor};
`;

export const BubbleFooter = styled(Box)`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
  font-size: 12px;
`;

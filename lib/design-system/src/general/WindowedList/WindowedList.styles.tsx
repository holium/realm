import styled, { css } from 'styled-components';
import { List } from './source/List/List';

export const StyledList = styled(List)<{
  startAtBottom: boolean;
  hideScrollbar: boolean;
}>`
  ${({ startAtBottom }) =>
    startAtBottom &&
    css`
      :nth-child(1) {
        transform: scaleY(-1);
      }
    `}

  ${({ hideScrollbar }) =>
    hideScrollbar &&
    css`
      -ms-overflow-style: none;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    `}
`;

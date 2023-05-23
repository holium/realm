import styled, { css } from 'styled-components';

export const SCROLLBAR_WIDTH = 12;

export const scrollbarCss = css`
  ::-webkit-scrollbar {
    width: ${SCROLLBAR_WIDTH}px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 20px;
    border: 3px solid transparent;
    background-clip: content-box;
    background-color: transparent;
  }

  ::-webkit-scrollbar-track {
    border-radius: 20px;
    border: 3px solid transparent;
    background-clip: content-box;
    background-color: transparent;
  }
`;

export const scrollbarHoverCss = css`
  ::-webkit-scrollbar-thumb {
    background-color: rgba(var(--rlm-text-rgba), 0.3);
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(var(--rlm-text-rgba), 0.6);
  }

  ::-webkit-scrollbar-track:hover {
    background-color: rgba(var(--rlm-input-rgba), 0.3);
  }
`;

export const WindowedListContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  > :nth-child(1) {
    overflow-x: hidden;
    overflow-y: scroll !important;

    ${scrollbarCss}
  }

  &:hover {
    > :nth-child(1) {
      ${scrollbarHoverCss}
    }
  }
`;

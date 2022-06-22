import styled, { css } from 'styled-components';

interface ISkeleton {
  height: number;
  width: number;
}

export const Skeleton = styled.div<ISkeleton>`
  width: 100%;
  ${(props: ISkeleton) => css`
    height: ${props.height}px;
    width: ${props.width}px;
  `}
  display: block;
  border-radius: 3px;
  animation: skeleton-loading 1s linear infinite alternate;

  @keyframes skeleton-loading {
    0% {
      background-color: hsl(230, 20%, 95%);
    }
    100% {
      background-color: hsl(230, 20%, 88%);
    }
  }
  @keyframes shine {
    to {
      background-position: 100% 0;
    }
  }
`;

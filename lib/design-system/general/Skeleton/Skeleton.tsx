import styled, { css } from 'styled-components';

interface ISkeleton {
  height: number;
  width?: number;
  borderRadius?: number;
}

export const skeletonStyle = css`
  display: block;
  animation: skeleton-loading 1s linear infinite alternate;
  width: 100%;
  min-height: 1em;
  border-radius: var(--rlm-border-radius-4);
  @keyframes skeleton-loading {
    0% {
      background-color: rgba(var(--rlm-base-rgba));
      opacity: 0.2;
    }
    100% {
      background-color: rgba(var(--rlm-base-rgba));
      opacity: 0.4;
    }
  }
  @keyframes shine {
    to {
      background-position: 100% 0;
    }
  }
`;

export const Skeleton = styled.div<ISkeleton>`
  ${(props: ISkeleton) =>
    css`
      height: ${props.height}px;
      width: ${props.width ? `${props.width}px` : '100%'};
      border-radius: ${props.borderRadius || 4}px;
    `}
  ${skeletonStyle}
`;

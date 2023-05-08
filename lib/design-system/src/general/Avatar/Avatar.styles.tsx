import styled from 'styled-components';

import { Box } from '../Box/Box';

type Props = {
  sigilSize?: number;
  borderRadiusOverride?: string;
  clickable?: boolean;
};

export const AvatarWrapper = styled.div<Props>`
  overflow: hidden;
  box-sizing: content-box;
  pointer-events: none;
  border-radius: var(--rlm-border-radius-4);
  transition: var(--transition);

  img {
    user-select: none;
    pointer-events: none;
    background: rgba(var(--rlm-base-rgba));
    border-radius: var(--rlm-border-radius-4);
  }

  ${({ clickable }) =>
    clickable &&
    `
      pointer-events: auto;
      cursor: pointer;
      -webkit-filter: brightness(100%);
      transition: var(--transition);
      &:hover {
        -webkit-filter: brightness(96%);
        transition: var(--transition);
      }
      &:active {
        -webkit-filter: brightness(92%);
        transition: var(--transition);
      }
    `}

  ${({ borderRadiusOverride }) =>
    borderRadiusOverride &&
    `
      border-radius: ${borderRadiusOverride};
    `}
`;

export const AvatarInner = styled(Box)<{ src: string }>`
  background-image: url(${({ src }) => src});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

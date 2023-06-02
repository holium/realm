import { ReactNode, RefObject } from 'react';
import styled from 'styled-components';

type Props = {
  innerRef?: RefObject<HTMLDivElement>;
  hasTitleBar?: boolean;
  children?: ReactNode;
};

export const DialogViewContainer = styled.div<Props>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 0;
  width: inherit;
  height: inherit;
  padding: 24px;
  background: rgba(var(--rlm-window-rgba), 0.9);
  backdrop-filter: var(--blur);
`;

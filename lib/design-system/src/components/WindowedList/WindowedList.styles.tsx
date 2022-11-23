import styled from 'styled-components';
import { VariableSizeList as List } from 'react-window';

export interface StyledListProps {
  hideScrollbar?: boolean;
}

// TODO: make our own scrollbar.
export const StyledList = styled(List)<StyledListProps>`
  ${({ hideScrollbar }) =>
    hideScrollbar &&
    `
    &::-webkit-scrollbar {
      display: none;
    }
  `}
`;

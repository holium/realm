import styled from 'styled-components';
import { List } from './react-virtualized';

export interface StyledListProps {
  hideScrollbar?: boolean;
}

// TODO: make our own scrollbar.
export const StyledList: typeof List = styled(List)<StyledListProps>`
  ${({ hideScrollbar = true }) =>
    hideScrollbar &&
    `
    &::-webkit-scrollbar {
      display: none;
    }
  `}
`;

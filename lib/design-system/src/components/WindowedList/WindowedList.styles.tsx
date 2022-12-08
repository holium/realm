import styled from 'styled-components';
import List from './source/List/List';

export const StyledList = styled(List)<{ hideScrollbar: boolean }>`
  ${({ hideScrollbar }) =>
    hideScrollbar &&
    `
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  `}
`;

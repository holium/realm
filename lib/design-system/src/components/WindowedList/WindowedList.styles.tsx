import styled from 'styled-components';
import AutoSizerImport from 'react-virtualized-auto-sizer';
import {
  VariableSizeList as ListImport,
  ListOnScrollProps as ListOnScrollPropsImport,
} from 'react-window';

export const AutoSizer = AutoSizerImport;

export type ListType = ListImport<any>;

export type ListOnScrollProps = ListOnScrollPropsImport;

export interface StyledListProps {
  hideScrollbar?: boolean;
}

// TODO: make our own scrollbar.
export const List = styled(ListImport)<StyledListProps>`
  ${({ hideScrollbar }) =>
    hideScrollbar &&
    `
    &::-webkit-scrollbar {
      display: none;
    }
  `}
`;

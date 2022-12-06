import React from 'react';
export type RowRendererParams = {
  index: number;
  isScrolling: boolean;
  isVisible: boolean;
  key: string;
  parent: Record<string, any>;
  style: Record<string, any>;
};
export type RowRenderer = (
  params: RowRendererParams
) => React.ReactElement<any>;
export type RenderedRows = {
  overscanStartIndex: number;
  overscanStopIndex: number;
  startIndex: number;
  stopIndex: number;
};
export type Scroll = {
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
};

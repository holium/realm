import { ElementRef, PureComponent } from 'react';
import type { RowRenderer, RenderedRows, Scroll } from './types';
import type {
  NoContentRenderer,
  OverscanIndicesGetter,
  CellSize,
  Alignment,
  CellPosition,
  CellRendererParams,
  RenderedSection,
} from '../Grid/types';
import { accessibilityOverscanIndicesGetter } from '../Grid/accessibilityOverscanIndicesGetter';
import { Grid } from '../Grid/Grid';

/**
 * This component renders a virtualized list of elements with either fixed or dynamic heights.
 */
type Props = {
  /** Optional CSS class name */
  className?: string;

  /**
   * If CellMeasurer is used to measure this Grid's children, this should be a pointer to its CellMeasurerCache.
   * A shared CellMeasurerCache reference enables Grid and CellMeasurer to share measurement data.
   */
  deferredMeasurementCache?: Record<string, any>;

  /**
   * Used to estimate the total height of a List before all of its rows have actually been measured.
   * The estimated total height is adjusted as rows are rendered.
   */
  estimatedRowSize: number;

  /** Height constraint for list (determines how many actual rows are rendered) */
  height: number;

  /** Optional renderer to be used in place of rows when rowCount is 0 */
  noRowsRenderer: NoContentRenderer;

  /** Callback invoked with information about the slice of rows that were just rendered.  */
  onRowsRendered: (params: RenderedRows) => void;

  /**
   * Callback invoked whenever the scroll offset changes within the inner scrollable region.
   * This callback can be used to sync scrolling between lists, tables, or grids.
   */
  onScroll?: (params: Scroll) => void;

  /** See Grid#overscanIndicesGetter */
  overscanIndicesGetter: OverscanIndicesGetter;

  /**
   * Number of rows to render above/below the visible bounds of the list.
   * These rows can help for smoother scrolling on touch devices.
   */
  overscanRowCount: number;

  /** Either a fixed row height (number) or a function that returns the height of a row given its index.  */
  rowHeight: CellSize;

  /** Responsible for rendering a row given an index; ({ index: number }): node */
  rowRenderer: RowRenderer;

  /** Number of rows in list. */
  rowCount: number;

  /** Start adding elements from the bottom and scroll on mount/update. */
  startAtBottom?: boolean;

  /** See Grid#scrollToAlignment */
  scrollToAlignment: Alignment;

  /** Row index to ensure visible (by forcefully scrolling if necessary) */
  scrollToIndex: number;

  /** Vertical offset. */
  scrollTop?: number;

  /** Optional inline style */
  style: Record<string, any>;

  /** Tab index for focus */
  tabIndex?: number;

  /** Width of list */
  width: number;
};

export class List extends PureComponent<Props> {
  static defaultProps = {
    estimatedRowSize: 30,
    onScroll: () => {},
    noRowsRenderer: () => null,
    onRowsRendered: () => {},
    overscanIndicesGetter: accessibilityOverscanIndicesGetter,
    overscanRowCount: 10,
    scrollToAlignment: 'auto',
    scrollToIndex: -1,
    style: {},
  };
  Grid: ElementRef<typeof Grid> | null | undefined;

  forceUpdateGrid() {
    if (this.Grid) {
      this.Grid.forceUpdate();
    }
  }

  /** See Grid#getOffsetForCell */
  getOffsetForRow({
    alignment,
    index,
  }: {
    alignment: Alignment;
    index: number;
  }) {
    if (this.Grid) {
      const { scrollTop } = this.Grid.getOffsetForCell({
        alignment,
        rowIndex: index,
        columnIndex: 0,
      });
      return scrollTop;
    }

    return 0;
  }

  /** CellMeasurer compatibility */
  invalidateCellSizeAfterRender({ columnIndex, rowIndex }: CellPosition) {
    if (this.Grid) {
      this.Grid.invalidateCellSizeAfterRender({
        rowIndex,
        columnIndex,
      });
    }
  }

  /** See Grid#measureAllCells */
  measureAllRows() {
    if (this.Grid) {
      this.Grid.measureAllCells();
    }
  }

  /** CellMeasurer compatibility */
  recomputeGridSize({
    columnIndex = 0,
    rowIndex = 0,
  }: Partial<CellPosition> = {}) {
    if (this.Grid) {
      this.Grid.recomputeGridSize({
        rowIndex,
        columnIndex,
      });
    }
  }

  /** See Grid#recomputeGridSize */
  recomputeRowHeights(index: number = 0) {
    if (this.Grid) {
      this.Grid.recomputeGridSize({
        rowIndex: index,
        columnIndex: 0,
      });
    }
  }

  /** See Grid#scrollToPosition */
  scrollToPosition(scrollTop: number = 0) {
    if (this.Grid) {
      this.Grid.scrollToPosition({
        scrollTop,
      });
    }
  }

  /** See Grid#scrollToCell */
  scrollToRow(index: number = 0) {
    if (this.Grid) {
      this.Grid.scrollToCell({
        columnIndex: 0,
        rowIndex: index,
      });
    }
  }

  render() {
    const { className, noRowsRenderer, scrollToIndex, width } = this.props;
    return (
      <Grid
        {...this.props}
        cellRenderer={this._cellRenderer}
        className={className}
        columnWidth={width}
        columnCount={1}
        noContentRenderer={noRowsRenderer}
        onScroll={this._onScroll}
        onSectionRendered={this._onSectionRendered}
        ref={this._setRef}
        scrollToRow={scrollToIndex}
      />
    );
  }

  _cellRenderer = ({
    parent,
    rowIndex,
    style,
    isScrolling,
    isVisible,
    key,
  }: CellRendererParams) => {
    const { rowRenderer } = this.props;
    // TRICKY The style object is sometimes cached by Grid.
    // This prevents new style objects from bypassing shallowCompare().
    // However as of React 16, style props are auto-frozen (at least in dev mode)
    // Check to make sure we can still modify the style before proceeding.
    // https://github.com/facebook/react/commit/977357765b44af8ff0cfea327866861073095c12#commitcomment-20648713
    const widthDescriptor = Object.getOwnPropertyDescriptor(style, 'width');

    if (widthDescriptor && widthDescriptor.writable) {
      // By default, List cells should be 100% width.
      // This prevents them from flowing under a scrollbar (if present).
      style.width = '100%';
    }

    return rowRenderer({
      index: rowIndex,
      style,
      isScrolling,
      isVisible,
      key,
      parent,
    });
  };
  _setRef = (ref: ElementRef<typeof Grid> | null | undefined) => {
    this.Grid = ref;
  };
  _onScroll = ({ clientHeight, scrollHeight, scrollTop }: any) => {
    const { onScroll } = this.props;
    onScroll?.({
      clientHeight,
      scrollHeight,
      scrollTop,
    });
  };
  _onSectionRendered = ({
    rowOverscanStartIndex,
    rowOverscanStopIndex,
    rowStartIndex,
    rowStopIndex,
  }: RenderedSection) => {
    const { onRowsRendered } = this.props;
    onRowsRendered({
      overscanStartIndex: rowOverscanStartIndex,
      overscanStopIndex: rowOverscanStopIndex,
      startIndex: rowStartIndex,
      stopIndex: rowStopIndex,
    });
  };
}
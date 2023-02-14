import { Component, ReactElement } from 'react';
import { createDetectElementResize } from './detectElementResize';

export type Size = {
  width: number;
  height: number;
};

type Props = {
  children: (size: Size) => ReactElement<any>;
  disableWidth?: boolean;
  disableHeight?: boolean;
  defaultWidth?: number;
  defaultHeight?: number;
};

type ResizeHandler = (element: HTMLElement, onResize: () => void) => void;

type DetectElementResize = {
  addResizeListener: ResizeHandler;
  removeResizeListener: ResizeHandler;
};

export class AutoSizer extends Component<Props, Size> {
  static defaultProps = {
    disableWidth: false,
    disableHeight: false,
  };
  state = {
    width: this.props.defaultWidth ?? 0,
    height: this.props.defaultHeight ?? 0,
  };
  _parentNode: HTMLElement | null | undefined;
  _autoSizer: HTMLElement | null | undefined;
  _window: Window | null | undefined;

  _detectElementResize: DetectElementResize | undefined;

  componentDidMount() {
    if (
      this._autoSizer &&
      this._autoSizer.parentNode &&
      this._autoSizer.parentNode.ownerDocument &&
      this._autoSizer.parentNode.ownerDocument.defaultView &&
      this._autoSizer.parentNode instanceof
        this._autoSizer.parentNode.ownerDocument.defaultView.HTMLElement
    ) {
      // Delay access of parentNode until mount.
      // This handles edge-cases where the component has already been unmounted before its ref has been set,
      // As well as libraries like react-lite which have a slightly different lifecycle.
      this._parentNode = this._autoSizer.parentNode;
      this._window = this._autoSizer.parentNode.ownerDocument.defaultView;
      // Defer requiring resize handler in order to support server-side rendering.
      this._detectElementResize = createDetectElementResize(this._window);

      this._detectElementResize.addResizeListener(
        this._parentNode,
        this._onResize
      );

      this._onResize();
    }
  }

  componentWillUnmount() {
    if (this._detectElementResize && this._parentNode) {
      this._detectElementResize.removeResizeListener(
        this._parentNode,
        this._onResize
      );
    }
  }

  render() {
    const { children, disableWidth, disableHeight } = this.props;
    const { width, height } = this.state;

    const outerStyle: Record<string, any> = {
      overflow: 'visible',
    };
    const childParams: Record<string, any> = {};

    if (!disableHeight) {
      outerStyle.height = 0;
      childParams.height = height;
    }

    if (!disableWidth) {
      outerStyle.width = 0;
      childParams.width = width;
    }

    return (
      <div ref={this._setRef} style={{ ...outerStyle }}>
        {children(childParams as Size)}
      </div>
    );
  }

  _onResize = () => {
    const { disableWidth, disableHeight } = this.props;

    if (this._parentNode) {
      const height = this._parentNode.offsetHeight || 0;
      const width = this._parentNode.offsetWidth || 0;
      const win = this._window || window;
      const style = win.getComputedStyle(this._parentNode) || {};
      const paddingLeft = parseInt(style.paddingLeft, 10) || 0;
      const paddingRight = parseInt(style.paddingRight, 10) || 0;
      const paddingTop = parseInt(style.paddingTop, 10) || 0;
      const paddingBottom = parseInt(style.paddingBottom, 10) || 0;
      const newHeight = height - paddingTop - paddingBottom;
      const newWidth = width - paddingLeft - paddingRight;

      if (
        (!disableHeight && this.state.height !== newHeight) ||
        (!disableWidth && this.state.width !== newWidth)
      ) {
        this.setState({
          height: height - paddingTop - paddingBottom,
          width: width - paddingLeft - paddingRight,
        });
      }
    }
  };

  _setRef = (autoSizer: HTMLElement | null | undefined) => {
    this._autoSizer = autoSizer;
  };
}

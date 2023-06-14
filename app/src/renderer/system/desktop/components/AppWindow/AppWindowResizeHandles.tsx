import { MotionValue, PanInfo } from 'framer-motion';

import {
  BottomLeftDragHandle,
  BottomRightDragHandle,
  TopLeftDragHandle,
  TopRightDragHandle,
} from './AppWindow.styles';

type MotionPosition = {
  x: MotionValue<number>;
  y: MotionValue<number>;
};

type DragHandler = (event: MouseEvent, info: PanInfo) => void;

type Props = {
  zIndex: number;
  topLeft: MotionPosition;
  topRight: MotionPosition;
  bottomLeft: MotionPosition;
  bottomRight: MotionPosition;
  onDragTopLeft: DragHandler;
  onDragTopRight: DragHandler;
  onDragBottomLeft: DragHandler;
  onDragBottomRight: DragHandler;
};

export const AppWindowResizeHandles = ({
  zIndex,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  onDragTopLeft,
  onDragTopRight,
  onDragBottomLeft,
  onDragBottomRight,
}: Props) => (
  <>
    <TopLeftDragHandle
      drag
      key={`top-left-${topLeft.x.get()}-${topLeft.y.get()}`}
      zIndex={zIndex}
      className="app-window-resize"
      onDrag={onDragTopLeft}
      dragMomentum={false}
    />
    <TopRightDragHandle
      drag
      key={`top-right-${topRight.x.get()}-${topRight.y.get()}`}
      zIndex={zIndex}
      className="app-window-resize"
      onDrag={onDragTopRight}
      dragMomentum={false}
    />
    <BottomLeftDragHandle
      drag
      key={`bottom-left-${bottomLeft.x.get()}-${bottomLeft.y.get()}`}
      zIndex={zIndex}
      className="app-window-resize"
      onDrag={onDragBottomLeft}
      dragMomentum={false}
    />
    <BottomRightDragHandle
      drag
      key={`bottom-right-${bottomRight.x.get()}-${bottomRight.y.get()}`}
      zIndex={zIndex}
      className="app-window-resize"
      onDrag={onDragBottomRight}
      dragMomentum={false}
    />
  </>
);

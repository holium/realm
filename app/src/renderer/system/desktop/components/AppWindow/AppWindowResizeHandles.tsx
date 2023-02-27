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
  setIsResizing: (isResizing: boolean) => void;
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
  setIsResizing,
}: Props) => (
  <>
    <TopLeftDragHandle
      drag
      zIndex={zIndex}
      className="app-window-resize"
      style={topLeft}
      onDrag={onDragTopLeft}
      onPointerDown={() => setIsResizing(true)}
      onPointerUp={() => setIsResizing(false)}
      onPanEnd={() => setIsResizing(false)}
      onTap={() => setIsResizing(false)}
      dragMomentum={false}
    />
    <TopRightDragHandle
      drag
      zIndex={zIndex}
      className="app-window-resize"
      style={topRight}
      onDrag={onDragTopRight}
      onPointerDown={() => setIsResizing(true)}
      onPointerUp={() => setIsResizing(false)}
      onPanEnd={() => setIsResizing(false)}
      onTap={() => setIsResizing(false)}
      dragMomentum={false}
    />
    <BottomLeftDragHandle
      drag
      zIndex={zIndex}
      className="app-window-resize"
      style={bottomLeft}
      onDrag={onDragBottomLeft}
      onPointerDown={() => setIsResizing(true)}
      onPointerUp={() => setIsResizing(false)}
      onPanEnd={() => setIsResizing(false)}
      onTap={() => setIsResizing(false)}
      dragMomentum={false}
    />
    <BottomRightDragHandle
      zIndex={zIndex}
      className="app-window-resize"
      drag
      style={bottomRight}
      onDrag={onDragBottomRight}
      onPointerDown={() => setIsResizing(true)}
      onPointerUp={() => setIsResizing(false)}
      onPanEnd={() => setIsResizing(false)}
      onTap={() => setIsResizing(false)}
      dragMomentum={false}
    />
  </>
);

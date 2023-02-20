import { MotionValue, PanInfo } from 'framer-motion';
import { BottomLeftDragHandle, BottomRightDragHandle } from './Airlift.styles';

type MotionPosition = {
  x: MotionValue<number>;
  y: MotionValue<number>;
};

type DragHandler = (event: MouseEvent, info: PanInfo) => void;

type Props = {
  bottomLeft: MotionPosition;
  bottomRight: MotionPosition;
  onDragBottomLeft: DragHandler;
  onDragBottomRight: DragHandler;
  setIsResizing: (isResizing: boolean) => void;
};

export const AirliftResizeHandles = ({
  bottomLeft,
  bottomRight,
  onDragBottomLeft,
  onDragBottomRight,
  setIsResizing,
}: Props) => (
  <>
    <BottomLeftDragHandle
      drag
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

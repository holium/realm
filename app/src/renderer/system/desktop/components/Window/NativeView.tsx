import { WindowModelProps } from 'os/services/shell/desktop.model';
import { nativeRenderers, WindowId } from 'renderer/apps/native';

export interface NativeViewProps {
  window: WindowModelProps | any;
  isResizing: boolean;
  isDragging: boolean;
  hasTitlebar: boolean | undefined;
}

export const NativeView = ({
  window,
  isResizing,
  isDragging,
}: NativeViewProps) => {
  const ViewComponent = nativeRenderers[window.id as WindowId].component;

  return <ViewComponent isResizing={isResizing} isDragging={isDragging} />;
};

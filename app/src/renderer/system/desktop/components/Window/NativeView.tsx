import { WindowModelType } from 'os/services/shell/desktop.model';
import { nativeRenderers, AppId } from 'renderer/apps/native';

export interface NativeViewProps {
  window: WindowModelType;
  isResizing: boolean;
  isDragging: boolean;
  hasTitlebar: boolean | undefined;
}

export const NativeView = ({
  window,
  isResizing,
  isDragging,
}: NativeViewProps) => {
  const ViewComponent = nativeRenderers[window.appId as AppId].component;

  return <ViewComponent isResizing={isResizing} isDragging={isDragging} />;
};

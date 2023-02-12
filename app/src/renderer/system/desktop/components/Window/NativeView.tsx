import { WindowModelType } from 'os/services/shell/desktop.model';
import { nativeRenderers, AppId } from 'renderer/apps/native';

export interface NativeViewProps {
  appWindow: WindowModelType;
  isResizing: boolean;
  isDragging: boolean;
  hasTitlebar: boolean | undefined;
}

export const NativeView = ({
  appWindow,
  isResizing,
  isDragging,
}: NativeViewProps) => {
  const ViewComponent = nativeRenderers[appWindow.appId as AppId].component;

  return <ViewComponent isResizing={isResizing} isDragging={isDragging} />;
};

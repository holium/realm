import { WindowModelProps } from 'os/services/shell/desktop.model';
import { nativeRenderers, WindowId } from 'renderer/apps/native';

export interface NativeViewProps {
  window: WindowModelProps | any;
  isResizing?: boolean;
  hasTitlebar: boolean | undefined;
}

export const NativeView = ({ window, isResizing }: NativeViewProps) => {
  const ViewComponent = nativeRenderers[window.id as WindowId].component;

  return <ViewComponent isResizing={Boolean(isResizing)} />;
};

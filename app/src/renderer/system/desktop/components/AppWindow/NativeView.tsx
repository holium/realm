import { WindowModelType } from 'os/services/shell/desktop.model';
import {
  nativeRenderers,
  AppId,
} from 'renderer/system/desktop/components/AppWindow/native';

type Props = {
  appWindow: WindowModelType;
  isResizing: boolean;
  isDragging: boolean;
};

export const NativeView = ({ appWindow, isResizing, isDragging }: Props) => {
  const ViewComponent = nativeRenderers[appWindow.appId as AppId].component;

  return <ViewComponent isResizing={isResizing} isDragging={isDragging} />;
};

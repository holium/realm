import { AppWindowType } from 'os/services/shell/desktop.model';
import { NativeAppId, nativeAppWindow } from './nativeAppWindow';

type Props = {
  appWindow: AppWindowType;
  isResizing: boolean;
  isDragging: boolean;
};

export const NativeView = ({ appWindow, isResizing, isDragging }: Props) => {
  const ViewComponent = nativeAppWindow[appWindow.appId as NativeAppId].view;

  return <ViewComponent isResizing={isResizing} isDragging={isDragging} />;
};

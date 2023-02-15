import { AppWindowType } from 'os/services/shell/desktop.model';
import { NativeAppId, getNativeAppWindow } from '../getNativeAppWindow';

type Props = {
  appWindow: AppWindowType;
  isResizing: boolean;
  isDragging: boolean;
};

export const NativeView = ({ appWindow, isResizing, isDragging }: Props) => {
  const ViewComponent = getNativeAppWindow[appWindow.appId as NativeAppId].view;

  return <ViewComponent isResizing={isResizing} isDragging={isDragging} />;
};

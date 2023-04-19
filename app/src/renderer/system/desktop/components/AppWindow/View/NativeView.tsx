import { AppWindowMobxType } from 'renderer/stores/models/window.model';
import { NativeAppId, getNativeAppWindow } from '../getNativeAppWindow';

type Props = {
  appWindow: AppWindowMobxType;
  isResizing: boolean;
  isDragging: boolean;
};

export const NativeView = ({ appWindow, isResizing, isDragging }: Props) => {
  const ViewComponent = getNativeAppWindow[appWindow.appId as NativeAppId].view;

  return <ViewComponent isResizing={isResizing} isDragging={isDragging} />;
};

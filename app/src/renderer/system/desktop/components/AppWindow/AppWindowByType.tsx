import { DialogView } from 'renderer/system/dialog/Dialog/Dialog';
import { AppWindowType } from 'os/services/shell/desktop.model';
import { AppView } from './View/AppView';
import { DevView } from './View/DevView';
import { NativeView } from './View/NativeView';

type Props = {
  isResizing: boolean;
  isDragging: boolean;
  appWindow: AppWindowType;
};

export const AppWindowByType = ({
  isResizing,
  isDragging,
  appWindow,
}: Props) => {
  switch (appWindow.type) {
    case 'native':
      return (
        <NativeView
          isDragging={isDragging}
          isResizing={isResizing}
          appWindow={appWindow}
        />
      );
    case 'urbit':
      return (
        <AppView
          isDragging={isDragging}
          isResizing={isResizing}
          appWindow={appWindow}
        />
      );
    case 'web':
      return <DevView isResizing={isResizing} appWindow={appWindow} />;
    case 'dev':
      return <DevView isResizing={isResizing} appWindow={appWindow} />;
    case 'dialog':
      return <DialogView appWindow={appWindow} />;
    default:
      return <div>No view</div>;
  }
};

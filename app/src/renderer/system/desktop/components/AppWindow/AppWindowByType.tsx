import { DialogView } from 'renderer/system/dialog/Dialog/Dialog';
import { WindowModelType } from 'os/services/shell/desktop.model';
import { AppView } from './AppView';
import { DevView } from './DevView';
import { NativeView } from './NativeView';

type Props = {
  hasTitlebar: boolean;
  isResizing: boolean;
  isDragging: boolean;
  appWindow: WindowModelType;
};

export const AppWindowByType = ({
  hasTitlebar,
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
          hasTitlebar={hasTitlebar}
          isResizing={isResizing}
          appWindow={appWindow}
        />
      );
    case 'web':
      return (
        <DevView
          hasTitlebar={hasTitlebar}
          isResizing={isResizing}
          appWindow={appWindow}
        />
      );
    case 'dev':
      return (
        <DevView
          hasTitlebar={hasTitlebar}
          isResizing={isResizing}
          appWindow={appWindow}
        />
      );
    case 'dialog':
      return <DialogView appWindow={appWindow} />;
    default:
      return <div>No view</div>;
  }
};

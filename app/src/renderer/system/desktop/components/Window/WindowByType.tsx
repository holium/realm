import { nativeApps } from 'renderer/apps';
import { DialogView } from 'renderer/system/dialog/Dialog/Dialog';
import { WindowModelType } from 'os/services/shell/desktop.model';
import { AppView } from './AppView';
import { DevView } from './DevView';
import { NativeView } from './NativeView';

type Props = {
  hasTitlebar: boolean;
  isResizing: boolean;
  isDragging: boolean;
  window: WindowModelType;
};

export const WindowByType = ({
  hasTitlebar,
  isResizing,
  isDragging,
  window,
}: Props) => {
  switch (window.type) {
    case 'native':
      return (
        <NativeView
          isDragging={isDragging}
          isResizing={isResizing}
          hasTitlebar={nativeApps[window.appId].native?.hideTitlebarBorder}
          window={window}
        />
      );
    case 'urbit':
      return (
        <AppView
          isDragging={isDragging}
          hasTitlebar={hasTitlebar}
          isResizing={isResizing}
          window={window}
        />
      );
    case 'web':
      return (
        <DevView
          hasTitlebar={hasTitlebar}
          isResizing={isResizing}
          window={window}
        />
      );
    case 'dev':
      return (
        <DevView
          hasTitlebar={hasTitlebar}
          isResizing={isResizing}
          window={window}
        />
      );
    case 'dialog':
      return <DialogView window={window} />;
    default:
      return <div>No view</div>;
  }
};

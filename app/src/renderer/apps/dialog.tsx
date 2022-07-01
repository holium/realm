import { WindowModelProps } from 'os/services/shell/desktop.model';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { CreateSpaceModal } from './Spaces/Workflow/CreateSpaceModal';
import { WallpaperDialogConfig } from './System/Dialogs/Wallpaper';

export type DialogConfig = {
  titlebar?: React.FC<any>;
  component: React.FC<any>;
  onOpen?: () => void;
  onClose?: () => void;
  window: WindowModelProps;
  hasCloseButton: boolean;
  noTitlebar?: boolean;
};

export type DialogRenderers = {
  [key: string]: DialogConfig;
};

export const dialogRenderers: DialogRenderers = {
  'wallpaper-dialog': WallpaperDialogConfig,
  'create-spaces-1': {
    component: (props: any) => <CreateSpaceModal {...props} />,
    onOpen: () => {
      DesktopActions.setBlur(true);
    },
    onClose: () => {
      DesktopActions.setBlur(false);
      DesktopActions.closeDialog();
    },
    window: {
      id: 'create-spaces-1',
      title: 'Make a Space',
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 580,
        height: 550,
      },
    },
    hasCloseButton: true,
  },
};

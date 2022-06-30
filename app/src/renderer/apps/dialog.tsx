import { WindowModelProps } from 'os/services/shell/desktop.model';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { CreateSpaceModal } from './Spaces/Workflow/CreateSpaceModal';
import { WallpaperDialog } from './System/Dialogs/Wallpaper';

export type DialogRenders = {
  [key: string]: {
    titlebar?: React.FC<any>;
    component: React.FC<any>;
    onOpen?: () => void;
    onClose?: () => void;
    window: WindowModelProps;
    hasCloseButton: boolean;
    noTitlebar?: boolean;
  };
};

// export const dialogManifest:

export const dialogRenderers: DialogRenders = {
  'wallpaper-dialog': {
    component: (props: any) => <WallpaperDialog {...props} />,
    // onOpen: () => {
    //   // DesktopActions.setBlur(true);
    // },
    onClose: () => {
      // DesktopActions.closeDialog();
      // DesktopActions.setBlur(false);
    },
    window: {
      id: 'wallpaper-dialog',
      title: 'Wallpaper Dialog',
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 300,
        height: 300,
      },
    },
    hasCloseButton: false,
    noTitlebar: true,
  },
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

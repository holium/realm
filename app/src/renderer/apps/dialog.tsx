import { WindowModelProps } from 'os/services/shell/desktop.model';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { CreateSpaceModal } from './Spaces/Workflow/CreateSpaceModal';
import { SpacesFinalSummary } from './Spaces/Workflow/FinalSummary';
import { SelectArchetype } from './Spaces/Workflow/SelectArchetype';
import { WallpaperDialogConfig } from './System/Dialogs/Wallpaper';

export type BaseWorkflowProps = {
  workflow?: boolean; // lets the dialog manager know if this dialog is in a workflow
  firstStep?: boolean; // identifies the first dialog in a workflow
  customNext?: boolean; // an override to remove the next button if the dialog has a custom "next" component
  workflowState?: any; // the state that is passed between the various dialogs in a workflow
  setState?: (data: any) => void; // a function that is passed into the dialog component for setting workflow state.
  isValidated?: (state: any) => boolean;
  onNext?: (data?: any) => void;
  onPrevious?: (data?: any) => void;
};

export type BaseDialogProps = {
  onOpen?: () => void;
  onClose?: () => void;
  hasCloseButton: boolean;
  noTitlebar?: boolean;
} & BaseWorkflowProps;

export type DialogConfig = {
  titlebar?: React.FC<any>;
  component: React.FC<any>;
  window: WindowModelProps;
} & BaseDialogProps;

export type DialogRenderers = {
  [key: string]: DialogConfig;
};

export const dialogRenderers: DialogRenderers = {
  'wallpaper-dialog': WallpaperDialogConfig,
  'create-spaces-1': {
    workflow: true,
    firstStep: true,
    customNext: true,
    component: (props: any) => <CreateSpaceModal {...props} />,
    onOpen: () => {
      DesktopActions.setBlur(true);
    },
    onNext: (data: any) => {
      DesktopActions.nextDialog('create-spaces-2');
    },
    onClose: () => {
      DesktopActions.setBlur(false);
      DesktopActions.closeDialog();
    },
    window: {
      id: 'create-spaces-1',
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
  'create-spaces-2': {
    workflow: true,
    customNext: false,
    component: (props: any) => <SelectArchetype {...props} />,
    isValidated: (state: any) => {
      if (state && state.archetype) {
        return true;
      } else {
        return false;
      }
    },
    onNext: (data: any) => {
      DesktopActions.nextDialog('create-spaces-3');
    },
    onPrevious: () => {
      DesktopActions.nextDialog('create-spaces-1');
    },
    onClose: () => {
      DesktopActions.setBlur(false);
      DesktopActions.closeDialog();
    },
    window: {
      id: 'create-spaces-2',
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
  'create-spaces-3': {
    workflow: true,
    component: (props: any) => <SpacesFinalSummary {...props} />,

    onNext: (data: any) => {
      DesktopActions.nextDialog('create-spaces-3');
    },
    onPrevious: () => {
      DesktopActions.nextDialog('create-spaces-2');
    },
    onClose: () => {
      DesktopActions.setBlur(false);
      DesktopActions.closeDialog();
    },
    window: {
      id: 'create-spaces-3',
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

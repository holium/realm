import { DesktopActions } from 'renderer/logic/actions/desktop';
import { DialogRenderers } from 'renderer/system/dialog/dialogs';
import { CreateSpaceModal } from './CreateSpaceModal';
import { SpacesCreateForm } from './CreateForm';
import { SelectArchetype } from './SelectArchetype';

export const spacesDialogs: DialogRenderers = {
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
    component: (props: any) => <SpacesCreateForm {...props} />,

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
        height: 600,
      },
    },
    hasCloseButton: true,
  },
};

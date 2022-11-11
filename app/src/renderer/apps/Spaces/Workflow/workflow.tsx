import { ShellActions } from 'renderer/logic/actions/shell';
import { DialogRenderers } from 'renderer/system/dialog/dialogs';

import { CreateSpaceModal } from './SelectType';
import { SpacesCreateForm } from './Details';
import { SelectArchetype } from './SelectArchetype';
import { InviteMembers } from './InviteMembers';
import { SpacesActions } from 'renderer/logic/actions/spaces';

type NewSpace = {
  access: 'public' | 'antechamber' | 'private';
  archetype: 'home' | 'community';
  archetypeTitle?: 'Home' | 'Community';
  color?: string;
  picture?: string;
  members: { [patp: string]: 'owner' | 'initiate' | 'admin' | 'member' };
  name: string;
  type: 'our' | 'group' | 'space';
};

export const spacesDialogs: DialogRenderers = {
  'create-space-1': {
    workflow: true,
    firstStep: true,
    customNext: true,
    // stateKey: 'create-space',
    component: (props: any) => <CreateSpaceModal {...props} />,
    hasPrevious: () => true,
    onOpen: () => {
      ShellActions.setBlur(true, true);
    },
    onNext: (_evt: any) => {
      ShellActions.nextDialog('create-space-3');
    },
    onClose: () => {
      ShellActions.setBlur(false, true);
      ShellActions.closeDialog();
    },
    window: {
      id: 'create-space-1',
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 550,
        height: 570,
      },
    },
    hasCloseButton: true,
  },
  'create-space-2': {
    workflow: true,
    customNext: false,
    // stateKey: 'create-space',
    component: (props: any) => <SelectArchetype {...props} />,
    hasPrevious: () => true,
    isValidated: (data: any) => {
      if (data.archetype) {
        return true;
      } else {
        return false;
      }
    },
    onNext: (_evt: any) => {
      ShellActions.nextDialog('create-space-3');
    },
    onPrevious: () => {
      ShellActions.nextDialog('create-space-1');
    },
    onClose: () => {
      ShellActions.setBlur(false);
      ShellActions.closeDialog();
    },
    window: {
      id: 'create-space-2',
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 550,
        height: 570,
      },
    },
    hasCloseButton: true,
  },
  'create-space-3': {
    workflow: true,
    // stateKey: 'create-space',
    component: (props: any) => <SpacesCreateForm {...props} />,
    hasPrevious: () => true,
    onNext: (_evt: any) => {
      ShellActions.nextDialog('create-space-4');
    },
    onPrevious: () => {
      ShellActions.nextDialog('create-space-1');
    },
    onClose: () => {
      ShellActions.setBlur(false);
      ShellActions.closeDialog();
    },
    isValidated: (state: any) => {
      if (
        state &&
        state.access &&
        state.name &&
        state.color &&
        state.picture !== undefined
      ) {
        return true;
      } else {
        return false;
      }
    },
    window: {
      id: 'create-space-3',
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 550,
        height: 570,
      },
    },
    hasCloseButton: true,
  },
  'create-space-4': {
    workflow: true,
    // stateKey: 'create-space',
    component: (props: any) => <InviteMembers {...props} />,
    hasPrevious: () => true,
    nextButtonText: 'Create Space',
    onNext: (_evt: any, state: any, setState: any) => {
      const createForm: NewSpace = state;
      delete createForm['archetypeTitle'];
      setState({ ...state, loading: true });
      // DesktopActions.setDialogLoading(true);
      SpacesActions.createSpace(createForm).then(() => {
        // DesktopActions.closeDialog();
        setState({ loading: false });
        // DesktopActions.setBlur(false);
      });
    },
    onPrevious: () => {
      ShellActions.nextDialog('create-space-3');
    },
    onClose: () => {
      ShellActions.setBlur(false);
      ShellActions.closeDialog();
    },
    isValidated: () => {
      return true;
    },
    window: {
      id: 'create-space-4',
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 550,
        height: 570,
      },
    },
    hasCloseButton: true,
  },
};

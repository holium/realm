import { ShellActions } from 'renderer/logic/actions/shell';
import { DialogRenderers } from 'renderer/system/dialog/dialogs';

import { CreateSpaceModal } from './SelectType';
import { SpacesCreateForm } from './Details';
import { SelectArchetype } from './SelectArchetype';
import { InviteMembers } from './InviteMembers';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { toJS } from 'mobx';

interface NewSpace {
  access: 'public' | 'antechamber' | 'private';
  archetype: 'home' | 'community';
  archetypeTitle?: 'Home' | 'Community';
  color?: string;
  picture?: string;
  members: { [patp: string]: 'owner' | 'initiate' | 'admin' | 'member' };
  name: string;
  description: string;
  type: 'our' | 'group' | 'space';
}

export const spacesDialogs: DialogRenderers = {
  'create-space-1': {
    workflow: true,
    firstStep: true,
    customNext: true,
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
    windowProps: {
      appId: 'create-space-1',
      zIndex: 13,
      type: 'dialog',
      bounds: {
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
    onNext: (_evt: any, _state: any) => {
      ShellActions.nextDialog('create-space-3');
    },
    onPrevious: () => {
      ShellActions.nextDialog('create-space-1');
    },
    onClose: () => {
      ShellActions.setBlur(false);
      ShellActions.closeDialog();
    },
    windowProps: {
      appId: 'create-space-2',
      zIndex: 13,
      type: 'dialog',
      bounds: {
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
    component: (props: any) => <SpacesCreateForm {...props} />,
    hasPrevious: () => true,
    onNext: (_evt: any, _state: any, _setState: any) => {
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
        (state.picture !== undefined || state.color !== undefined)
      ) {
        return true;
      } else {
        return false;
      }
    },
    windowProps: {
      appId: 'create-space-3',
      zIndex: 13,
      type: 'dialog',
      bounds: {
        x: 0,
        y: 0,
        width: 550,
        height: 570,
      },
    },
    hasCloseButton: true,
  },
  'edit-space': (dialogProps: any) => ({
    workflow: true,
    component: (props: any) => (
      <SpacesCreateForm edit={dialogProps} {...props} />
    ),
    hasPrevious: () => false,
    nextButtonText: 'Update Space',
    onNext: (_evt: any, state: any, setState: any) => {
      if (state.crestOption === 'color') {
        state.image = '';
      }
      let createForm = state;
      if (!createForm.archetype) createForm.archetype = 'community';
      delete createForm['archetypeTitle'];
      setState({ ...state, loading: true });
      createForm = {
        name: createForm.name,
        description: createForm.description || '',
        access: createForm.access,
        picture: createForm.image,
        color: createForm.color,
        theme: toJS(createForm.theme),
      };
      SpacesActions.updateSpace(state.path, createForm).then(() => {
        setState({ loading: false });
      });
    },
    onPrevious: () => {},
    onClose: () => {
      ShellActions.setBlur(false);
      ShellActions.closeDialog();
    },
    isValidated: (state: any) => {
      if (
        state &&
        state.access &&
        state.name &&
        (state.picture !== undefined || state.color !== undefined)
      ) {
        return true;
      } else {
        return false;
      }
    },
    windowProps: {
      appId: 'edit-space',
      zIndex: 13,
      type: 'dialog',
      bounds: {
        x: 0,
        y: 0,
        width: 550,
        height: 570,
      },
    },
    hasCloseButton: true,
  }),
  'create-space-4': {
    workflow: true,
    component: (props: any) => <InviteMembers {...props} />,
    hasPrevious: () => true,
    nextButtonText: 'Create Space',
    onNext: (_evt: any, state: any, setState: any) => {
      setState({
        ...state,
        loading: true,
      });
      delete state.archetypeTitle;
      state.description = state.description || '';
      if (state.crestOption === 'color') {
        state.image = '';
      }
      const createForm: NewSpace = state;
      SpacesActions.createSpace(createForm).then(() => {
        setState({ loading: false });
      });
    },
    onPrevious: () => {
      ShellActions.nextDialog('create-space-3');
    },
    onClose: () => {
      ShellActions.setBlur(false);
      ShellActions.closeDialog();
    },
    isValidated: (state: any) => {
      return state && state.members;
    },
    windowProps: {
      appId: 'create-space-4',
      zIndex: 13,
      type: 'dialog',
      bounds: {
        x: 0,
        y: 0,
        width: 550,
        height: 570,
      },
    },
    hasCloseButton: true,
  },
};

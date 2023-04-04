import { toJS } from 'mobx';
import { DialogRenderers } from 'renderer/system/dialog/dialogs';
import { normalizeBounds } from 'os/services/shell/lib/window-manager';
import { CreateSpaceModal } from './SelectType';
import { SpacesCreateForm } from './Details';
import { SelectArchetype } from './SelectArchetype';
import { InviteMembers } from './InviteMembers';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { appState } from 'renderer/stores/app.store';

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
    hasCloseButton: true,
    component: (props: any) => <CreateSpaceModal {...props} />,
    hasPrevious: () => true,
    onOpen: () => {
      appState.shellStore.setIsBlurred(true);
    },
    onNext: (_evt: any) => {
      appState.shellStore.openDialog('create-space-3');
    },
    onClose: () => {
      appState.shellStore.setIsBlurred(false);
      appState.shellStore.closeDialog();
    },
    getWindowProps: (desktopDimensions) => ({
      appId: 'create-space-1',
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 550,
          height: 570,
        },
        desktopDimensions
      ),
    }),
  },
  'create-space-2': {
    workflow: true,
    customNext: false,
    hasCloseButton: true,
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
      appState.shellStore.openDialog('create-space-3');
    },
    onPrevious: () => {
      appState.shellStore.openDialog('create-space-1');
    },
    onClose: () => {
      appState.shellStore.setIsBlurred(false);
      appState.shellStore.closeDialog();
    },
    getWindowProps: (desktopDimensions) => ({
      appId: 'create-space-2',
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 550,
          height: 570,
        },
        desktopDimensions
      ),
    }),
  },
  'create-space-3': {
    workflow: true,
    hasCloseButton: true,
    component: (props: any) => <SpacesCreateForm {...props} />,
    hasPrevious: () => true,
    onNext: (_evt: any, _state: any, _setState: any) => {
      appState.shellStore.openDialog('create-space-4');
    },
    onPrevious: () => {
      appState.shellStore.openDialog('create-space-1');
    },
    onClose: () => {
      appState.shellStore.setIsBlurred(false);
      appState.shellStore.closeDialog();
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
    getWindowProps: (desktopDimensions) => ({
      appId: 'create-space-3',
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 550,
          height: 570,
        },
        desktopDimensions
      ),
    }),
  },
  'edit-space': (dialogProps: any) => ({
    workflow: true,
    hasCloseButton: true,
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
      appState.shellStore.setIsBlurred(false);
      appState.shellStore.closeDialog();
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
    getWindowProps: (desktopDimensions) => ({
      appId: 'edit-space',
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 550,
          height: 570,
        },
        desktopDimensions
      ),
    }),
  }),
  'create-space-4': {
    workflow: true,
    hasCloseButton: true,
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
      appState.shellStore.openDialog('create-space-3');
    },
    onClose: () => {
      appState.shellStore.setIsBlurred(false);
      appState.shellStore.closeDialog();
    },
    isValidated: (state: any) => {
      return state && state.members;
    },
    getWindowProps: (desktopDimensions) => ({
      appId: 'create-space-4',
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 550,
          height: 570,
        },
        desktopDimensions
      ),
    }),
  },
};

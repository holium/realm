import { toJS } from 'mobx';
import { DialogRenderers } from 'renderer/system/dialog/dialogs';
import { normalizeBounds } from 'renderer/lib/window-manager';
import { CreateSpaceModal } from './SelectType';
import { SpacesCreateForm } from './Details';
import { InviteMembers } from './InviteMembers';
import { appState } from 'renderer/stores/app.store';
import { shipStore } from 'renderer/stores/ship.store';
import { NewSpace } from 'os/services/ship/spaces/spaces.service';

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
      shipStore.spacesStore.updateSpace(state.path, createForm).then(() => {
        setState({ loading: false });
        appState.shellStore.setIsBlurred(false);
        appState.shellStore.closeDialog();
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
        state.picture = '';
      }
      const createForm: NewSpace = state;
      shipStore.spacesStore.createSpace(createForm).then(() => {
        setState({ loading: false });
        appState.shellStore.closeDialog();
        appState.shellStore.setIsBlurred(false);
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

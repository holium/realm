import { NewSpace } from 'os/services/ship/spaces/spaces.service';
import { normalizeBounds } from 'renderer/lib/window-manager';
import { appState } from 'renderer/stores/app.store';
import { shipStore } from 'renderer/stores/ship.store';
import { DialogRenderers } from 'renderer/system/dialog/dialogs';

import { EditSpace } from './EditSpace/EditSpace';
import { SpaceWorkFlowState } from './EditSpace/types';
import { InviteMembers } from './InviteMembers';
import { CreateSpaceModal } from './SelectType';

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
    component: (props: any) => <EditSpace {...props} />,
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
    component: (props: any) => <EditSpace edit={dialogProps} {...props} />,
    hasPrevious: () => false,
    nextButtonText: 'Update Space',
    onNext: (
      _evt: any,
      state: SpaceWorkFlowState,
      setState: (state: Partial<SpaceWorkFlowState>) => void
    ) => {
      let createForm = state;
      setState({ ...state, loading: true });

      if (createForm.crestOption === 'color') {
        createForm.picture = '';
      }
      if (!createForm.archetype) createForm.archetype = 'community';
      delete createForm['archetypeTitle'];

      const payload = {
        name: createForm.name,
        description: createForm.description,
        access: createForm.access,
        picture: createForm.picture,
        color: createForm.color,
        theme: createForm.theme,
        joinLink: createForm.joinLink,
      };

      shipStore.spacesStore.updateSpace(state.path, payload as any).then(() => {
        setState({ ...state, loading: false });
        appState.shellStore.setIsBlurred(false);
        appState.shellStore.closeDialog();
      });
    },
    onPrevious: () => {},
    onClose: () => {
      appState.shellStore.setIsBlurred(false);
      appState.shellStore.closeDialog();
    },
    isValidated: (state: SpaceWorkFlowState) => {
      const isStateValid = Boolean(
        state &&
          state.access &&
          state.name &&
          (state.picture !== undefined || state.color !== undefined)
      );

      return isStateValid;
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
          height: 685,
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
      console.log('state', state);
      setState({
        ...state,
        loading: true,
      });
      delete state.archetypeTitle;
      state.description = state.description || '';
      if (state.crestOption === 'color') {
        state.picture = '';
      } else {
        state.picture = state.image;
        delete state.image;
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

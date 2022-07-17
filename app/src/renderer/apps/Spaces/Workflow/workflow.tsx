import { applySnapshot, Instance, types } from 'mobx-state-tree';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { DialogRenderers } from 'renderer/system/dialog/dialogs';
import { toJS } from 'mobx';

import { CreateSpaceModal } from './SelectType';
import { SpacesCreateForm } from './Details';
import { SelectArchetype } from './SelectArchetype';
import { InviteMembers } from './InviteMembers';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { createContext, useContext } from 'react';

type NewSpace = {
  access: 'public' | 'antechamber' | 'private';
  archetype: 'home' | 'lodge';
  archetypeTitle?: 'Home' | 'Lodge';
  color?: string;
  picture?: string;
  members: { [patp: string]: 'owner' | 'initiate' | 'admin' | 'member' };
  name: string;
  type: 'our' | 'group' | 'space';
};

// // This state tree is passed between workflow steps
// const NewSpaceModel = types
//   .model({
//     loading: types.optional(types.boolean, false),
//     // Step 1
//     title: types.maybe(types.string),
//     image: types.maybe(types.string),
//     subtitle: types.maybe(types.string),
//     // Poke data
//     type: types.maybe(types.enumeration(['our', 'group', 'space'])),
//     access: types.maybe(
//       types.enumeration(['public', 'antechamber', 'private'])
//     ),
//     archetype: types.maybe(types.enumeration(['home', 'lodge'])),
//     archetypeTitle: types.maybe(types.enumeration(['Home', 'Lodge'])),
//     name: types.maybe(types.string),
//     color: types.optional(types.string, '#000000'),
//     picture: types.optional(types.string, ''),
//     members: types.map(
//       types.array(types.enumeration(['owner', 'initiate', 'admin', 'member']))
//     ),
//   })
//   .actions((self) => ({
//     set(data: any) {
//       applySnapshot(self, data);
//     },
//     reset() {
//       self = NewSpaceModel.create();
//     },
//   }));

// export const createSpacesState = NewSpaceModel.create();

export const spacesDialogs: DialogRenderers = {
  'create-space-1': {
    workflow: true,
    firstStep: true,
    customNext: true,
    // stateKey: 'create-space',
    component: (props: any) => <CreateSpaceModal {...props} />,
    onOpen: () => {
      DesktopActions.setBlur(true);
    },
    onNext: (_evt: any) => {
      DesktopActions.nextDialog('create-space-2');
    },
    onClose: () => {
      DesktopActions.setBlur(false);
      DesktopActions.closeDialog();
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
    isValidated: (data: any) => {
      if (data.archetype) {
        return true;
      } else {
        return false;
      }
    },
    onNext: (_evt: any) => {
      DesktopActions.nextDialog('create-space-3');
    },
    onPrevious: () => {
      DesktopActions.nextDialog('create-space-1');
    },
    onClose: () => {
      DesktopActions.setBlur(false);
      DesktopActions.closeDialog();
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
    onNext: (_evt: any) => {
      DesktopActions.nextDialog('create-space-4');
    },
    onPrevious: () => {
      DesktopActions.nextDialog('create-space-2');
    },
    onClose: () => {
      DesktopActions.setBlur(false);
      DesktopActions.closeDialog();
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
    nextButtonText: 'Create Place',
    onNext: (_evt: any, state: any, setState: any) => {
      const createForm: NewSpace = state;
      delete createForm['archetypeTitle'];
      setState({ ...state, loading: true });
      // DesktopActions.setDialogLoading(true);
      SpacesActions.createSpace(createForm).then((newSpace: any) => {
        console.log(newSpace);
        // DesktopActions.setDialogLoading(true);\
        setState({ loading: false });
        DesktopActions.closeDialog();
        DesktopActions.setBlur(false);
        SpacesActions.selectSpace(newSpace.path);
      });
    },
    onPrevious: () => {
      DesktopActions.nextDialog('create-space-3');
    },
    onClose: () => {
      DesktopActions.setBlur(false);
      DesktopActions.closeDialog();
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

import { DesktopActions } from 'renderer/logic/actions/desktop';
import { DialogRenderers } from 'renderer/system/dialog/dialogs';
import { CreateSpaceModal } from './CreateSpaceModal';
import { SpacesFinalSummary } from './FinalSummary';
import { SelectArchetype } from './SelectArchetype';
import DisclaimerDialog from '../../../system/onboarding/Disclaimer.dialog'
import HaveUrbitDialog from 'renderer/system/onboarding/HaveUrbit.dialog';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';

export const onboardingDialogs: DialogRenderers = {
  'onboarding:disclaimer': {
    workflow: true,
    firstStep: true,
    hasCloseButton: true,
    customNext: false,
    component: (props: any) => <DisclaimerDialog {...props} />,
    isValidated: (state: any) => {
      console.log(state)
      return state && state.disclaimerAccepted
    },
    onOpen: () => {
      DesktopActions.setBlur(true);
    },
    onNext: (data: any) => {
      OnboardingActions.agreedToDisclaimer();
      DesktopActions.nextDialog('onboarding:have-urbit-id');
    },
    onClose: () => {
      DesktopActions.setBlur(false);
      DesktopActions.closeDialog();
    },
    window: {
      id: 'onboarding:disclaimer',
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 520,
        height: 490,
      },
    },
  },
  'onboarding:have-urbit-id': {
    workflow: true,
    hasCloseButton: true,
    customNext: true,
    component: (props: any) => <HaveUrbitDialog {...props} />,
    onPrevious: () => {
      DesktopActions.nextDialog('onboarding:disclaimer');
    },
    onNext(selfHosted: boolean) {
      OnboardingActions.setSelfHosted(selfHosted);
      return selfHosted
        ? DesktopActions.nextDialog('onboarding:connect-ship')
        : DesktopActions.nextDialog('onboarding:select-patp');
    },
    onClose: () => {
      DesktopActions.setBlur(false);
      DesktopActions.closeDialog();
    },
    window: {
      id: 'onboarding:have-urbit-id',
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 460,
        height: 400,
      },
    },
  },
  'onboarding:connect-ship': {
    workflow: true,
    hasCloseButton: true,
    component: (props: any) => <div {...props}>Connect Hosting Here</div>,
    onPrevious: () => {
      DesktopActions.nextDialog('onboarding:have-urbit-id');
    },
    onNext: () => 'placeholder',
    onClose: () => {
      DesktopActions.setBlur(false);
      DesktopActions.closeDialog();
    },
    window: {
      id: 'onboarding:connect-ship',
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 460,
        height: 400,
      },
    },
  },
  'onboarding:select-patp': {
    workflow: true,
    hasCloseButton: true,
    component: (props: any) => <div {...props}>Select @p Here</div>,
    onPrevious: () => {
      DesktopActions.nextDialog('onboarding:have-urbit-id');
    },
    onNext: () => 'placeholder',
    onClose: () => {
      DesktopActions.setBlur(false);
      DesktopActions.closeDialog();
    },
    window: {
      id: 'onboarding:select-patp',
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 460,
        height: 400,
      },
    },
  },
}

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

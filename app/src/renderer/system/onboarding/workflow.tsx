import { DesktopActions } from 'renderer/logic/actions/desktop';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { OnboardingStep } from 'os/services/onboarding/onboarding.model';

import { DialogRenderers } from 'renderer/system/dialog/dialogs';
import DisclaimerDialog from 'renderer/system/onboarding/Disclaimer.dialog'
import HaveUrbitDialog from 'renderer/system/onboarding/HaveUrbit.dialog';
import AddShip from 'renderer/system/onboarding/AddShip.dialog';
import ConnectingShip from 'renderer/system/onboarding/ConnectingShip.dialog';
import ProfileSetup from 'renderer/system/onboarding/ProfileSetup.dialog';
import SetPassword from 'renderer/system/onboarding/SetPassword.dialog';
import InstallAgent from 'renderer/system/onboarding/InstallAgent.dialog';
import SelectPatp from 'renderer/system/onboarding/SelectPatp.dialog';
import SelectPlan from 'renderer/system/onboarding/SelectPlan.dialog';
import StripePayment from 'renderer/system/onboarding/StripePayment.dialog';
import HostingConfirmation from 'renderer/system/onboarding/HostingConfirmation.dialog';
import AccessCode from 'renderer/system/onboarding/AccessCode.dialog';

const initialOnboardingDialogs: DialogRenderers = {
  [OnboardingStep.DISCLAIMER]: {
    workflow: true,
    firstStep: true,
    hasCloseButton: false,
    customNext: false,
    component: (props: any) => <DisclaimerDialog {...props} />,
    isValidated: (state: any) => {
      return state && state.disclaimerAccepted
    },
    onOpen: () => {
      DesktopActions.setBlur(true);
    },
    onNext: (data: any) => {
      console.log('next?')
      OnboardingActions.agreedToDisclaimer();
      OnboardingActions.setStep(OnboardingStep.HAVE_URBIT_ID);
    },
    window: {
      id: OnboardingStep.DISCLAIMER,
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
  [OnboardingStep.HAVE_URBIT_ID]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: any) => <HaveUrbitDialog {...props} />,
    onNext(selfHosted: boolean) {
      OnboardingActions.setSelfHosted(selfHosted);
      return selfHosted
        ? OnboardingActions.setStep(OnboardingStep.ADD_SHIP)
        : OnboardingActions.setStep(OnboardingStep.ACCESS_CODE);
    },
    window: {
      id: OnboardingStep.HAVE_URBIT_ID,
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 460,
        height: 360,
      },
    },
  }
}




const selfHostedDialogs: DialogRenderers = {
  [OnboardingStep.ADD_SHIP]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: any) => <AddShip {...props } />,
    onPrevious: () => {
      OnboardingActions.setStep(OnboardingStep.HAVE_URBIT_ID);
    },
    onNext: () => OnboardingActions.setStep(OnboardingStep.CONNECTING_SHIP),
    window: {
      id: OnboardingStep.ADD_SHIP,
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 560,
        height: 300,
      },
    },
  }
}




const completeProfileDialogs: DialogRenderers = {
  [OnboardingStep.CONNECTING_SHIP]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: any) => <ConnectingShip {...props} />,
    onPrevious: () => OnboardingActions.setStep(OnboardingStep.PROFILE_SETUP),
    onNext:() => OnboardingActions.setStep(OnboardingStep.PROFILE_SETUP),
    window: {
      id: OnboardingStep.CONNECTING_SHIP,
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 560,
        height: 300
      }
    }
  },
  [OnboardingStep.PROFILE_SETUP]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: any) => <ProfileSetup {...props} />,
    onPrevious: () => OnboardingActions.setStep(OnboardingStep.ADD_SHIP),
    onNext:() => OnboardingActions.setStep(OnboardingStep.SET_PASSWORD),
    window: {
      id: OnboardingStep.PROFILE_SETUP,
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 560,
        height: 380
      }
    }
  },
  [OnboardingStep.SET_PASSWORD]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: any) => <SetPassword {...props} />,
    onPrevious: () => OnboardingActions.setStep(OnboardingStep.PROFILE_SETUP),
    onNext:() => OnboardingActions.setStep(OnboardingStep.INSTALL_AGENT),
    window: {
      id: OnboardingStep.SET_PASSWORD,
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 560,
        height: 300
      }
    }
  },
  [OnboardingStep.INSTALL_AGENT]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: any) => <InstallAgent {...props} />,
    onPrevious: () => OnboardingActions.setStep(OnboardingStep.PROFILE_SETUP),
    onNext:() => {},
    window: {
      id: OnboardingStep.INSTALL_AGENT,
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 560,
        height: 350
      }
    }
  },
}




const hostingProviderDialogs: DialogRenderers = {
  [OnboardingStep.ACCESS_CODE]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: any) => <AccessCode {...props} />,
    onPrevious: () => {
      OnboardingActions.setStep(OnboardingStep.HAVE_URBIT_ID)
    },
    onNext: () => OnboardingActions.setStep(OnboardingStep.SELECT_PATP),
    window: {
      id: OnboardingStep.ACCESS_CODE,
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 500,
        height: 400,
      },
    },
  },
  [OnboardingStep.SELECT_PATP]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: any) => <SelectPatp {...props} />,
    onPrevious: () => {
      OnboardingActions.setStep(OnboardingStep.ACCESS_CODE)
    },
    onNext: () => OnboardingActions.setStep(OnboardingStep.SELECT_HOSTING_PLAN),
    window: {
      id: OnboardingStep.SELECT_PATP,
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 460,
        height: 440,
      },
    },
  },
  [OnboardingStep.SELECT_HOSTING_PLAN]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: any) => <SelectPlan {...props} />,
    onPrevious: () => {
      OnboardingActions.setStep(OnboardingStep.SELECT_PATP)
    },
    onNext: () => OnboardingActions.setStep(OnboardingStep.STRIPE_PAYMENT),
    window: {
      id: OnboardingStep.SELECT_HOSTING_PLAN,
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 460,
        height: 500,
      },
    },
  },
    [OnboardingStep.STRIPE_PAYMENT]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: any) => <StripePayment {...props} />,
    onPrevious: () => OnboardingActions.setStep(OnboardingStep.SELECT_HOSTING_PLAN),
    onNext: () => OnboardingActions.setStep(OnboardingStep.CONFIRMATION),
    window: {
      id: OnboardingStep.STRIPE_PAYMENT,
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 750,
        height: 550,
      },
    },
  },
  [OnboardingStep.CONFIRMATION]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: any) => <HostingConfirmation {...props} />,
    onNext: () => OnboardingActions.setStep(OnboardingStep.PROFILE_SETUP),
    window: {
      id: OnboardingStep.CONFIRMATION,
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 460,
        height: 360,
      },
    },
  },
}

export const onboardingDialogs: DialogRenderers = {
  ...initialOnboardingDialogs,
  ...selfHostedDialogs,
  ...hostingProviderDialogs,
  ...completeProfileDialogs
}

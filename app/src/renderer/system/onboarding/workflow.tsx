import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { ShellActions } from 'renderer/logic/actions/shell';
import { OnboardingStep } from 'os/services/onboarding/onboarding.model';
import { servicesStore } from 'renderer/logic/store';
import {
  BaseDialogProps,
  DialogRenderers,
} from 'renderer/system/dialog/dialogs';
import { DisclaimerDialog } from 'renderer/system/onboarding/Disclaimer.dialog';
import { EmailDialog } from 'renderer/system/onboarding/Email.dialog';
import { HaveUrbitDialog } from 'renderer/system/onboarding/HaveUrbit.dialog';
import { AddShip } from 'renderer/system/onboarding/AddShip.dialog';
import { ProfileSetup } from 'renderer/system/onboarding/ProfileSetup.dialog';
import { SetPassword } from 'renderer/system/onboarding/SetPassword.dialog';
import { InstallAgent } from 'renderer/system/onboarding/InstallAgent.dialog';
import { SelectPatp } from 'renderer/system/onboarding/SelectPatp.dialog';
import {
  SelectPlan,
  SelectPlanProps,
} from 'renderer/system/onboarding/SelectPlan.dialog';
import {
  StripePayment,
  StripePaymentProps,
} from 'renderer/system/onboarding/StripePayment.dialog';
import { HostingConfirmation } from 'renderer/system/onboarding/HostingConfirmation.dialog';
import { AccessCode } from 'renderer/system/onboarding/AccessCode.dialog';
import { AccessGate } from 'renderer/system/onboarding/AccessGate.dialog';
import { AccessGatePassed } from 'renderer/system/onboarding/AccessGatePassed.dialog';
import { ViewCode } from './ViewCode.dialog';
import { CheckInstallationDialog } from './CheckInstallation.dialog';
import { normalizeBounds } from 'os/services/shell/lib/window-manager';

const initialOnboardingDialogs: DialogRenderers = {
  [OnboardingStep.DISCLAIMER]: {
    workflow: true,
    firstStep: true,
    hasCloseButton: false,
    customNext: false,
    component: (props: BaseDialogProps) => <DisclaimerDialog {...props} />,
    isValidated: (state: any) => {
      return state && state.disclaimerAccepted;
    },
    onOpen: () => {
      ShellActions.setBlur(true);
    },
    onNext: (_data: any) => {
      OnboardingActions.agreedToDisclaimer();
      OnboardingActions.setStep(OnboardingStep.ACCESS_GATE);
    },
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.DISCLAIMER,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 520,
          height: 490,
        },
        desktopDimensions
      ),
    }),
  },
  [OnboardingStep.ACCESS_GATE]: {
    workflow: true,
    firstStep: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: BaseDialogProps) => <AccessGate {...props} />,
    onOpen: () => {
      ShellActions.setBlur(true);
    },
    onNext: (recoveringAccount: boolean) => {
      if (recoveringAccount) {
        OnboardingActions.setStep(OnboardingStep.EMAIL);
      } else {
        OnboardingActions.setStep(OnboardingStep.ACCESS_GATE_PASSED);
      }
    },
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.ACCESS_GATE,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 400,
          height: 420,
        },
        desktopDimensions
      ),
    }),
  },
  [OnboardingStep.ACCESS_GATE_PASSED]: {
    workflow: true,
    firstStep: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: BaseDialogProps) => <AccessGatePassed {...props} />,
    onOpen: () => {
      ShellActions.setBlur(true);
    },
    onNext: (_data: any) => {
      OnboardingActions.setStep(OnboardingStep.EMAIL);
    },
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.ACCESS_GATE_PASSED,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 400,
          height: 300,
        },
        desktopDimensions
      ),
    }),
  },
  [OnboardingStep.EMAIL]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: BaseDialogProps) => <EmailDialog {...props} />,
    onOpen: () => {
      ShellActions.setBlur(true);
    },
    onNext: (_data: any) => {
      OnboardingActions.setStep(OnboardingStep.HAVE_URBIT_ID);
    },
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.EMAIL,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 450,
          height: 420, // ayyyy
        },
        desktopDimensions
      ),
    }),
  },
  [OnboardingStep.HAVE_URBIT_ID]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: BaseDialogProps) => <HaveUrbitDialog {...props} />,
    hasPrevious: () => !servicesStore.identity.auth.firstTime,
    onPrevious: () => {
      ShellActions.closeDialog();
      OnboardingActions.exitOnboarding();
    },
    async onNext(selfHosted: boolean) {
      OnboardingActions.setSelfHosted(selfHosted);
      return selfHosted
        ? await OnboardingActions.setStep(OnboardingStep.ADD_SHIP)
        : await OnboardingActions.setStep(OnboardingStep.ACCESS_CODE);
    },
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.HAVE_URBIT_ID,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 460,
          height: 370,
        },
        desktopDimensions
      ),
    }),
  },
};

const selfHostedDialogs: DialogRenderers = {
  [OnboardingStep.ADD_SHIP]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: BaseDialogProps) => <AddShip {...props} />,
    hasPrevious: () => true,
    onPrevious: () => {
      OnboardingActions.setStep(OnboardingStep.HAVE_URBIT_ID);
    },
    onNext: async () =>
      await OnboardingActions.setStep(OnboardingStep.PRE_INSTALLATION_CHECK),
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.ADD_SHIP,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 460,
          height: 400,
        },
        desktopDimensions
      ),
    }),
  },
};

const completeProfileDialogs: DialogRenderers = {
  [OnboardingStep.PRE_INSTALLATION_CHECK]: {
    workflow: true,
    firstStep: false,
    hasCloseButton: false,
    customNext: false,
    component: (props: BaseDialogProps) => (
      <CheckInstallationDialog {...props} />
    ),
    isValidated: (state: any) => {
      console.log('isValidated => %o', state.versionVerified);
      return state && state.versionVerified;
    },
    onOpen: () => {
      ShellActions.setBlur(true);
    },
    onNext: () => {
      OnboardingActions.setStep(OnboardingStep.PROFILE_SETUP);
    },
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.PRE_INSTALLATION_CHECK,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 520,
          height: 490,
        },
        desktopDimensions
      ),
    }),
  },
  [OnboardingStep.PROFILE_SETUP]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: BaseDialogProps) => <ProfileSetup {...props} />,
    onPrevious: async () =>
      await OnboardingActions.setStep(OnboardingStep.ADD_SHIP),
    onNext: async () =>
      await OnboardingActions.setStep(OnboardingStep.SET_PASSWORD),
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.PROFILE_SETUP,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 560,
          height: 380,
        },
        desktopDimensions
      ),
    }),
  },
  [OnboardingStep.SET_PASSWORD]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: BaseDialogProps) => <SetPassword {...props} />,
    hasPrevious: () => true,
    onPrevious: async () =>
      await OnboardingActions.setStep(OnboardingStep.PROFILE_SETUP),
    onNext: async (isSelfHosted: boolean) => {
      console.log('is self hosted', isSelfHosted);
      if (!isSelfHosted) {
        OnboardingActions.completeOnboarding()
          .then(() => {
            console.log('completeOnboarding success');
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        await OnboardingActions.setStep(OnboardingStep.INSTALL_AGENT);
      }
    },
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.SET_PASSWORD,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 560,
          height: 380,
        },
        desktopDimensions
      ),
    }),
  },
  [OnboardingStep.INSTALL_AGENT]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: () => <InstallAgent />,
    hasPrevious: () => true,
    onPrevious: async () =>
      await OnboardingActions.setStep(OnboardingStep.SET_PASSWORD),
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.INSTALL_AGENT,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 560,
          height: 380,
        },
        desktopDimensions
      ),
    }),
  },
};

const hostingProviderDialogs: DialogRenderers = {
  [OnboardingStep.ACCESS_CODE]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: BaseDialogProps) => <AccessCode {...props} />,
    hasPrevious: () => true,
    onPrevious: () => {
      OnboardingActions.setStep(OnboardingStep.HAVE_URBIT_ID);
    },
    onNext: async () =>
      await OnboardingActions.setStep(OnboardingStep.SELECT_PATP),
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.ACCESS_CODE,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 500,
          height: 400,
        },
        desktopDimensions
      ),
    }),
  },
  [OnboardingStep.SELECT_PATP]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: BaseDialogProps) => <SelectPatp {...props} />,
    hasPrevious: () => true,
    onPrevious: () => {
      OnboardingActions.setStep(OnboardingStep.ACCESS_CODE);
    },
    onNext: async () =>
      await OnboardingActions.setStep(OnboardingStep.SELECT_HOSTING_PLAN),
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.SELECT_PATP,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 460,
          height: 440,
        },
        desktopDimensions
      ),
    }),
  },
  [OnboardingStep.SELECT_HOSTING_PLAN]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: SelectPlanProps) => <SelectPlan {...props} />,
    hasPrevious: () => true,
    onPrevious: () => {
      OnboardingActions.setStep(OnboardingStep.SELECT_PATP);
    },
    onNext: async () =>
      await OnboardingActions.setStep(OnboardingStep.STRIPE_PAYMENT),
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.SELECT_HOSTING_PLAN,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 750,
          height: 550,
        },
        desktopDimensions
      ),
    }),
  },
  [OnboardingStep.STRIPE_PAYMENT]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: StripePaymentProps) => <StripePayment {...props} />,
    hasPrevious: () => true,
    onPrevious: async () =>
      await OnboardingActions.setStep(OnboardingStep.SELECT_HOSTING_PLAN),
    onNext: async () =>
      await OnboardingActions.setStep(OnboardingStep.CONFIRMATION),
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.STRIPE_PAYMENT,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 750,
          height: 550,
        },
        desktopDimensions
      ),
    }),
  },
  [OnboardingStep.CONFIRMATION]: {
    workflow: true,
    hasCloseButton: false,
    customNext: true,
    component: (props: BaseDialogProps) => <HostingConfirmation {...props} />,
    onNext: async () =>
      await OnboardingActions.setStep(OnboardingStep.VIEW_CODE),
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.CONFIRMATION,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 460,
          height: 360,
        },
        desktopDimensions
      ),
    }),
  },
  [OnboardingStep.VIEW_CODE]: {
    workflow: true,
    hasCloseButton: false,
    customNext: false,
    isValidated: () => true,
    component: () => <ViewCode />,
    onNext: async (_evt: any, state: any, setState: any) => {
      setState({ ...state, isHosted: true });
      await OnboardingActions.setStep(OnboardingStep.PROFILE_SETUP);
    },
    getWindowProps: (desktopDimensions) => ({
      appId: OnboardingStep.VIEW_CODE,
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 460,
          height: 360,
        },
        desktopDimensions
      ),
    }),
  },
};

export const onboardingDialogs: DialogRenderers = {
  ...initialOnboardingDialogs,
  ...selfHostedDialogs,
  ...hostingProviderDialogs,
  ...completeProfileDialogs,
};

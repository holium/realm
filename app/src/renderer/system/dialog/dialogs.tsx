import { WindowModelProps } from 'os/services/shell/desktop.model';
import { ThemeModelType } from 'os/services/spaces/models/theme';
import { spacesDialogs } from 'renderer/apps/Spaces/Workflow/workflow';
import { onboardingDialogs } from 'renderer/system/onboarding/workflow';
import { WallpaperDialogConfig } from '../../apps/System/Dialogs/Wallpaper';

export type BaseWorkflowProps = {
  workflow?: boolean; // lets the dialog manager know if this dialog is in a workflow
  firstStep?: boolean; // identifies the first dialog in a workflow
  customNext?: boolean; // an override to remove the next button if the dialog has a custom "next" component
  nextButtonText?: string; // renames the text of "Next"
  workflowState?: any; // the state that is passed between the various dialogs in a workflow
  setState?: (data: any) => void; // a function that is passed into the dialog component for setting workflow state.
  isValidated?: (state: any) => boolean; // a function that takes in the state and can then check for value.
  onNext?: (evt?: any, state?: any, setState?: any) => void; // is the function executes when the "next" button is clicked.
  onPrevious?: (data?: any) => void; // is the function that executes whent the back arrow is clicked.
};

export type BaseDialogProps = {
  onOpen?: () => void; // is the funciton that executres when the dialog is opened
  onClose?: () => void; // is the funciton that executres when the dialog is closed
  hasCloseButton: boolean; // should the dialog have a close button in the top right
  noTitlebar?: boolean; // should there be the base window titlebar in the dialog
  theme?: ThemeModelType;
} & BaseWorkflowProps;

export type DialogConfig = {
  titlebar?: React.FC<any>;
  component: React.FC<any>;
  stateKey?: string;
  window: WindowModelProps;
} & BaseDialogProps;

export type DialogRenderers = {
  [key: string]: DialogConfig;
};

export const dialogRenderers: DialogRenderers = {
  'wallpaper-dialog': WallpaperDialogConfig,
  ...spacesDialogs,
  ...onboardingDialogs
};

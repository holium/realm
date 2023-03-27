import { FC } from 'react';
import { AppWindowProps } from 'os/services/shell/desktop.model';
import { ThemeModelType } from 'os/services/theme.model';
import { spacesDialogs } from 'renderer/apps/Spaces/Workflow/workflow';
import { onboardingDialogs } from 'renderer/system/onboarding/workflow';
import { WallpaperDialogConfig } from 'renderer/apps/System/Dialogs/Wallpaper';
import { LeaveSpaceDialogConfig } from 'renderer/apps/System/Dialogs/LeaveSpaceConfirm';
import { DeleteSpaceDialogConfig } from 'renderer/apps/System/Dialogs/DeleteSpaceConfirm';
import { AppDetailDialog } from 'renderer/apps/System/Dialogs/AppDetail';
import { ChangeEmailDialogConfig } from 'renderer/apps/System/Dialogs/ChangeEmail';
import { Dimensions } from '@holium/design-system';
import { ResetCodeDialogConfig } from '../auth/login/ResetCodeDialog';
import { LeaveChatDialogConfig } from 'renderer/apps/Courier/dialogs/LeaveChatDialog';

export interface BaseWorkflowProps {
  workflow?: boolean; // lets the dialog manager know if this dialog is in a workflow
  firstStep?: boolean; // identifies the first dialog in a workflow
  customNext?: boolean; // an override to remove the next button if the dialog has a custom "next" component
  nextButtonText?: string; // renames the text of "Next"
  workflowState?: any; // the state that is passed between the various dialogs in a workflow
  hasPrevious?: () => boolean;
  setState?: (data: any) => void; // a function that is passed into the dialog component for setting workflow state.
  isValidated?: (state: any) => boolean; // a function that takes in the state and can then check for value.
  onNext?: (evt?: any, state?: any, setState?: any) => void; // is the function executes when the "next" button is clicked.
  onPrevious?: (data?: any) => void; // is the function that executes whent the back arrow is clicked.
}

export type BaseDialogProps = {
  hasCloseButton: boolean; // should the dialog have a close button in the top right
  noTitlebar?: boolean; // should there be the base window titlebar in the dialog
  draggable?: boolean;
  unblurOnClose?: boolean;
  theme?: ThemeModelType;
  edit?: any;
  onOpen?: () => void; // is the function that executes when the dialog is opened
  onClose?: () => void; // is the function that executes when the dialog is closed
} & BaseWorkflowProps;

export type DialogConfig = {
  titlebar?: FC<any>;
  component: FC<any>;
  stateKey?: string;
  getWindowProps: (dekstopDimensions: Dimensions) => AppWindowProps;
} & BaseDialogProps;

export interface DialogRenderers {
  [key: string]: DialogConfig | ((props: any) => DialogConfig);
}

export const dialogRenderers: DialogRenderers = {
  'app-detail-dialog': AppDetailDialog,
  'wallpaper-dialog': WallpaperDialogConfig,
  'leave-space-dialog': LeaveSpaceDialogConfig,
  'leave-chat-dialog': LeaveChatDialogConfig,
  'delete-space-dialog': DeleteSpaceDialogConfig,
  'change-email-dialog': ChangeEmailDialogConfig,
  'reset-code-dialog': ResetCodeDialogConfig,
  ...spacesDialogs,
  ...onboardingDialogs,
};

import { SpacesActions } from 'renderer/logic/actions/spaces';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { ConfirmDialog } from './Confirm';

export const LeaveSpaceDialogConfig: (props: any) => DialogConfig = (props: any) => ({
  component: (props: any) => {
    /*const onConfirm = () => {
      SpacesActions.deleteSpace(dialogProps);
    }
    */
   const onConfirm = () => {}
    return <ConfirmDialog title="Leave Space" description={`Are you sure you want to leave?`} onConfirm={onConfirm} {...props} />
  },
  onClose: () => {},
  window: {
    id: 'leave-space-dialog',
    title: 'Leave Space Dialog',
    zIndex: 13,
    type: 'dialog',
    dimensions: {
      x: 0,
      y: 0,
      width: 300,
      height: 300,
    },
  },
  hasCloseButton: false,
  noTitlebar: true,
} as DialogConfig);


export const LeaveSpaceDialogConfigObject: DialogConfig = {
  component: (props: any) => {
    /*const onConfirm = () => {
      SpacesActions.deleteSpace(dialogProps);
    }
    */
    const onConfirm = () => {}
    return <ConfirmDialog title="Leave Space" description={`Are you sure you want to leave?`} onConfirm={onConfirm} {...props} />
  },
  onClose: () => {},
  window: {
    id: 'leave-space-dialog',
    title: 'Leave Space Dialog',
    zIndex: 13,
    type: 'dialog',
    dimensions: {
      x: 0,
      y: 0,
      width: 300,
      height: 300,
    },
  },
  hasCloseButton: false,
  noTitlebar: true,
} as DialogConfig;

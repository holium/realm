import { SpacesActions } from 'renderer/logic/actions/spaces';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { ConfirmDialog } from './Confirm';

export const LeaveSpaceDialogConfig: (dialogProps: any) => DialogConfig = (dialogProps: any) => {
  return ({
  component: (props: any) => {
    const onConfirm = async () => {
      if (dialogProps) {
        SpacesActions.deleteSpace(dialogProps.path);
      }
    }
    return <ConfirmDialog title="Leave Space" description={`Are you sure you want to leave ${dialogProps.name}?`} onConfirm={onConfirm} {...props} />
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
}
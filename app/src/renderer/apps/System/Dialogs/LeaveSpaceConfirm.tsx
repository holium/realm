import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { ConfirmDialog } from './Confirm';

export const LeaveSpaceDialogConfig: DialogConfig = {
  component: (props: any) => {
    console.log(props)
    return <ConfirmDialog title="Leave Space" description="Are you sure you want to leave this space?" onConfirm={() => {}} {...props} />
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
};

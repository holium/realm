import { useState } from 'react';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { ConfirmDialog } from './Confirm';

type LeaveSpaceDialogConfigComponentProps = {
  path: string;
  name: string;
  [key: string]: any;
};

const LeaveSpaceDialogConfigComponent = ({
  path,
  name,
  ...props
}: LeaveSpaceDialogConfigComponentProps) => {
  const [loading, setLoading] = useState(false);
  const onConfirm = async () => {
    if (path) {
      setLoading(true);
      SpacesActions.leaveSpace(path).then(() => {
        setLoading(false);
      });
    }
  };
  return (
    <ConfirmDialog
      title="Leave Space"
      description={`Are you sure you want to leave ${name}?`}
      confirmText="Leave"
      loading={loading}
      onConfirm={onConfirm}
      {...props}
    />
  );
};

export const LeaveSpaceDialogConfig: (dialogProps: any) => DialogConfig = (
  dialogProps: any
) =>
  ({
    component: (props: any) => (
      <LeaveSpaceDialogConfigComponent
        path={dialogProps.path}
        name={dialogProps.name}
        {...props}
      />
    ),
    onClose: () => {},
    window: {
      id: 'leave-space-dialog',
      title: 'Leave Space Dialog',
      zIndex: 13,
      type: 'dialog',
      dimensions: {
        x: 0,
        y: 0,
        width: 320,
        height: 180,
      },
    },
    hasCloseButton: false,
    noTitlebar: true,
  } as DialogConfig);

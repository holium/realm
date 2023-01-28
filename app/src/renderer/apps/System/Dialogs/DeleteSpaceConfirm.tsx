import { useState } from 'react';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { ConfirmDialog } from './Confirm';

export const DeleteSpaceDialogConfig: (dialogProps: any) => DialogConfig = (
  dialogProps: any
) => {
  const [loading, setLoading] = useState(false);
  return {
    component: (props: any) => {
      const onConfirm = async () => {
        if (dialogProps) {
          setLoading(true);
          SpacesActions.deleteSpace(dialogProps.path).then(() => {
            setLoading(false);
          });
        }
      };
      return (
        <ConfirmDialog
          title="Delete Space"
          description={`Are you sure you want to delete ${dialogProps.name}?`}
          confirmText="Delete"
          loading={loading}
          onConfirm={onConfirm}
          {...props}
        />
      );
    },
    onClose: () => {},
    window: {
      id: 'delete-space-dialog',
      title: 'Delete Space Dialog',
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
  } as DialogConfig;
};

import { useState } from 'react';

import { normalizeBounds } from 'renderer/lib/window-manager';
import { useShipStore } from 'renderer/stores/ship.store';
import { DialogConfig } from 'renderer/system/dialog/dialogs';

import { ConfirmDialog } from './Confirm';

type DeleteSpaceDialogConfigComponentProps = {
  path: string;
  name: string;
  [key: string]: any;
};

const DeleteSpaceDialogConfigComponent = ({
  path,
  name,
  ...props
}: DeleteSpaceDialogConfigComponentProps) => {
  const [loading, setLoading] = useState(false);
  const { spacesStore } = useShipStore();
  const onConfirm = async () => {
    if (path) {
      setLoading(true);
      spacesStore.deleteSpace(path).then(() => {
        setLoading(false);
      });
    }
  };

  return (
    <ConfirmDialog
      title="Delete Space"
      description={`Are you sure you want to delete ${name}?`}
      confirmText="Delete"
      loading={loading}
      onConfirm={onConfirm}
      {...props}
    />
  );
};

export const DeleteSpaceDialogConfig: (dialogProps: any) => DialogConfig = (
  dialogProps: any
) =>
  ({
    component: (props) => (
      <DeleteSpaceDialogConfigComponent
        path={dialogProps.path}
        name={dialogProps.name}
        {...props}
      />
    ),
    onClose: () => {},
    getWindowProps: (desktopDimensions) => ({
      appId: 'delete-space-dialog',
      title: 'Delete Space Dialog',
      zIndex: 13,
      type: 'dialog',
      bounds: normalizeBounds(
        {
          x: 0,
          y: 0,
          width: 320,
          height: 180,
        },
        desktopDimensions
      ),
    }),
    hasCloseButton: false,
    noTitlebar: true,
  } as DialogConfig);

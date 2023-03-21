import { normalizeBounds } from 'os/services/shell/lib/window-manager';
import { useState } from 'react';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { ConfirmDialog } from '../../System/Dialogs/Confirm';
import { useChatStore } from '../store';

type LeaveChatDialogConfigComponentProps = {
  path: string;
  [key: string]: any;
};

const LeaveChatDialogConfigComponent = ({
  path,
  amHost,
  our,
  ...props
}: LeaveChatDialogConfigComponentProps) => {
  const [loading, setLoading] = useState(false);
  const { getChatTitle, leaveChat } = useChatStore();
  const onConfirm = async () => {
    if (path) {
      setLoading(true);
      leaveChat(path).then(() => {
        setLoading(false);
      });
    }
  };

  const amHostBool = amHost === 'true';
  const chatTitle = getChatTitle(path, our);

  return (
    <ConfirmDialog
      title={amHostBool ? 'Delete chat' : 'Leave chat'}
      description={`Are you sure you want to ${
        amHostBool ? 'delete' : 'leave'
      } the chat ${chatTitle}?`}
      confirmText="Leave"
      loading={loading}
      onConfirm={onConfirm}
      {...props}
    />
  );
};

export const LeaveChatDialogConfig: (dialogProps: any) => DialogConfig = (
  dialogProps: any
) =>
  ({
    component: (props) => (
      <LeaveChatDialogConfigComponent
        path={dialogProps.path}
        amHost={dialogProps.amHost}
        our={dialogProps.our}
        {...props}
      />
    ),
    onClose: () => {},
    getWindowProps: (desktopDimensions) => ({
      appId: 'leave-chat-dialog',
      title: 'Leave chat Dialog',
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

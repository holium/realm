import { useState } from 'react';

import { normalizeBounds } from 'renderer/lib/window-manager';
import { DialogConfig } from 'renderer/system/dialog/dialogs';

import { useChatStore } from '../../../stores/chat.store';
import { ConfirmDialog } from '../../System/Dialogs/Confirm';

type LeaveChatDialogConfigComponentProps = {
  path: string;
  [key: string]: any;
};

const LeaveChatDialogConfigComponent = ({
  path,
  amHost,
  ...props
}: LeaveChatDialogConfigComponentProps) => {
  const [loading, setLoading] = useState(false);
  const { getChatHeader, leaveChat } = useChatStore();
  const onConfirm = async () => {
    if (path) {
      setLoading(true);
      leaveChat(path).then(() => {
        setLoading(false);
      });
    }
  };

  const amHostBool = amHost === 'true';
  const { title: chatTitle } = getChatHeader(path);

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

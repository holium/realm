import { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Button, Text } from 'renderer/components';
import { Flex, Box } from '@holium/design-system';
import { ShellActions } from 'renderer/logic/actions/shell';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { normalizeBounds } from 'os/services/shell/lib/window-manager';
import { trackEvent } from 'renderer/logic/lib/track';
import { AuthActions } from 'renderer/logic/actions/auth';

export const ShutdownDialogConfig: DialogConfig = {
  component: (props: any) => <ShutdownDialog {...props} />,
  getWindowProps: (desktopDimensions) => ({
    appId: 'shutdown-dialog',
    title: 'Shutdown Dialog',
    zIndex: 13,
    type: 'dialog',
    bounds: normalizeBounds(
      {
        x: 0,
        y: 0,
        width: 400,
        height: 160,
      },
      desktopDimensions
    ),
  }),
  draggable: false,
  hasCloseButton: false,
  unblurOnClose: true,
  noTitlebar: false,
};

const ShutdownDialogPresenter = () => {
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  function shutdown() {
    trackEvent('CLICK_SHUTDOWN', 'DESKTOP_SCREEN');
    AuthActions.shutdown();
  }

  useEffect(() => {
    console.log('timer', timer);
    if (!timer) {
      const timeout = setTimeout(shutdown, 60000);
      setTimer(timeout);
    }
  });

  return (
    <Flex px={12} width="100%" height="100%" flexDirection="column">
      <Text fontSize={4} fontWeight={500} mb={10}>
        Power Off
      </Text>
      <Text fontSize={2} lineHeight="copy" variant="body">
        Realm will power off automatically in 60 seconds.
      </Text>
      <Box mt={4} width="100%">
        <Button
          width="45%"
          disabled={false}
          onClick={() => {
            clearTimeout(timer);
            ShellActions.closeDialog();
            ShellActions.setBlur(false);
          }}
          variant="secondary"
        >
          Cancel
        </Button>
        <Button width="55%" disabled={false} onClick={shutdown}>
          Power Off
        </Button>
      </Box>
    </Flex>
  );
};

const ShutdownDialog = observer(ShutdownDialogPresenter);

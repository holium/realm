import { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Button, Text } from 'renderer/components';
import { Flex, Box } from '@holium/design-system';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { normalizeBounds } from 'os/services/shell/lib/window-manager';
import { trackEvent } from 'renderer/logic/lib/track';
import { AuthActions } from 'renderer/logic/actions/auth';
import { useAppState } from 'renderer/stores/app.store';

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
  const { shellStore } = useAppState();
  const [seconds, setSeconds] = useState(60);
  const [id, setId] = useState<NodeJS.Timer>();

  function shutdown() {
    trackEvent('CLICK_SHUTDOWN', 'DESKTOP_SCREEN');
    AuthActions.shutdown();
  }

  useEffect(() => {
    if (seconds <= 0) {
      shutdown();
    }
    if (!id) {
      const interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
      setId(interval);
    }
  });

  return (
    <Flex px={12} width="100%" height="100%" flexDirection="column">
      <Text fontSize={4} fontWeight={500} mb={10}>
        Power Off
      </Text>
      <Text fontSize={2} lineHeight="copy" variant="body">
        Realm will power off automatically in {seconds} second
        {seconds > 1 && 's'}.
      </Text>
      <Box mt={4} width="100%">
        <Flex width="100%" justifyContent="space-between">
          <Button
            width="45%"
            disabled={false}
            onClick={() => {
              id && clearInterval(id);
              shellStore.closeDialog();
              shellStore.setIsBlurred(false);
              // reset seconds/id for next open
              // 62 === 60 ???
              setId(undefined);
              setSeconds(62);
            }}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button width="50%" disabled={false} onClick={shutdown}>
            Power Off
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

const ShutdownDialog = observer(ShutdownDialogPresenter);

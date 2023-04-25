import { useEffect, useState } from 'react';
import { Button, Flex, Text } from '@holium/design-system';
import { observer } from 'mobx-react';
import { trackEvent } from 'renderer/lib/track';
import { normalizeBounds } from 'renderer/lib/window-manager';
import { useAppState } from 'renderer/stores/app.store';
import { DialogConfig } from 'renderer/system/dialog/dialogs';

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
  const { shellStore, authStore } = useAppState();
  const [seconds, setSeconds] = useState(60);
  const [id, setId] = useState<NodeJS.Timer>();

  function shutdown() {
    trackEvent('CLICK_SHUTDOWN', 'DESKTOP_SCREEN');
    authStore.shutdown();
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
    <Flex
      px={12}
      gap={16}
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Flex gap={10} flexDirection="column">
        <Text.Custom fontSize={3} fontWeight={500}>
          Power Off
        </Text.Custom>
        <Text.Custom fontSize={2} lineHeight="copy" variant="body">
          Realm will power off automatically in {seconds} second
          {seconds > 1 && 's'}.
        </Text.Custom>
      </Flex>
      <Flex width="100%">
        <Button.Secondary
          flex={1}
          justifyContent="center"
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
          <Flex py={2}>Cancel</Flex>
        </Button.Secondary>
        <Button.Primary
          flex={1}
          justifyContent="center"
          background="intent-alert"
          onClick={shutdown}
        >
          <Flex py={2}>Power Off</Flex>
        </Button.Primary>
      </Flex>
    </Flex>
  );
};

const ShutdownDialog = observer(ShutdownDialogPresenter);

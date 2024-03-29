import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { Button, Flex, Spinner, Text } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

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
  static: true,
  hasCloseButton: false,
  unblurOnClose: true,
  noTitlebar: false,
};

const ShutdownDialogPresenter = () => {
  const { shellStore, authStore } = useAppState();
  const [seconds, setSeconds] = useState(60);
  const [id, setId] = useState<NodeJS.Timer>();

  const shuttingDown = useToggle(false);

  const shutdown = async () => {
    shuttingDown.toggleOn();

    trackEvent('CLICK_SHUTDOWN', 'DESKTOP_SCREEN');
    await authStore.shutdown();

    shuttingDown.toggleOff();
  };

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
      <Flex gap="16px">
        <Button.Secondary
          flex={1}
          justifyContent="center"
          isDisabled={shuttingDown.isOn}
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
          <Flex py={1}>Cancel</Flex>
        </Button.Secondary>
        <Button.Primary
          flex={1}
          justifyContent="center"
          isDisabled={shuttingDown.isOn}
          onClick={shutdown}
        >
          {shuttingDown.isOn ? (
            <Spinner size={16} />
          ) : (
            <Flex py={1}>Power Off</Flex>
          )}
        </Button.Primary>
      </Flex>
    </Flex>
  );
};

const ShutdownDialog = observer(ShutdownDialogPresenter);

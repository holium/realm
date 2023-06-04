import { observer } from 'mobx-react';

import { Button, Flex, Text } from '@holium/design-system';

import { normalizeBounds } from 'renderer/lib/window-manager';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';
import { DialogConfig } from 'renderer/system/dialog/dialogs';

export const InstallAppDialogConfig: DialogConfig = {
  component: (props: any) => <InstallAppDialog {...props} />,
  getWindowProps: (desktopDimensions) => ({
    appId: 'install-confirm-dialog',
    title: 'Install Confirm Dialog',
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

const InstallAppDialogPresenter = ({
  name,
  desk,
}: {
  name: string;
  desk: string;
}) => {
  const { shellStore } = useAppState();
  const { bazaarStore } = useShipStore();

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
          Uninstall "{name}"?
        </Text.Custom>
        <Text.Custom fontSize={2} lineHeight="copy" variant="body">
          All processes will be stopped and their data archived, and the app
          will no longer receive updates.
        </Text.Custom>
        <Text.Custom fontSize={2} lineHeight="copy" variant="body">
          If the app is reinstalled, the archived data will be restored and
          you'll be able to pick up where you left off.
        </Text.Custom>
      </Flex>
      <Flex gap="16px">
        <Button.Secondary
          flex={1}
          justifyContent="center"
          onClick={() => {
            shellStore.closeDialog();
          }}
          variant="secondary"
        >
          <Flex py={1}>Cancel</Flex>
        </Button.Secondary>
        <Button.Primary
          flex={1}
          justifyContent="center"
          background="intent-alert"
          onClick={() => {
            shellStore.closeDialog();
            bazaarStore.uninstallApp(desk);
          }}
        >
          <Flex py={1}>Power Off</Flex>
        </Button.Primary>
      </Flex>
    </Flex>
  );
};

const InstallAppDialog = observer(InstallAppDialogPresenter);

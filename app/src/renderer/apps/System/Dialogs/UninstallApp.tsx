import { observer } from 'mobx-react';

import { Button, Flex, Text } from '@holium/design-system/general';

import { normalizeBounds } from 'renderer/lib/window-manager';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';
import { DialogConfig } from 'renderer/system/dialog/dialogs';

export const UninstallAppDialogConfig: (dialogProps: any) => DialogConfig = (
  dialogProps: any
) => ({
  component: (props) => (
    <UninstallAppDialog
      title={dialogProps.title}
      desk={dialogProps.desk}
      {...props}
    />
  ),
  getWindowProps: (desktopDimensions) => ({
    appId: 'uninstall-confirm-dialog',
    title: 'Uninstall Confirm Dialog',
    zIndex: 13,
    type: 'dialog',
    bounds: normalizeBounds(
      {
        x: 0,
        y: 0,
        width: 400,
        height: 270,
      },
      desktopDimensions
    ),
  }),
  static: true,
  hasCloseButton: false,
  unblurOnClose: true,
  noTitlebar: false,
});

const UninstallAppDialogPresenter = ({
  title,
  desk,
}: {
  title: string;
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
      <Flex gap={20} flexDirection="column">
        <Text.Custom fontSize={3} fontWeight={500}>
          Uninstall "{title}"?
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
          onClick={() => {
            shellStore.closeDialog();
            bazaarStore.uninstallApp(desk);
          }}
        >
          <Flex py={1}>Uninstall</Flex>
        </Button.Primary>
      </Flex>
    </Flex>
  );
};

const UninstallAppDialog = observer(UninstallAppDialogPresenter);

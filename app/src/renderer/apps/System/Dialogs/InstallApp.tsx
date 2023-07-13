import { observer } from 'mobx-react';

import { Button, Flex, Text } from '@holium/design-system/general';

import { normalizeBounds } from 'renderer/lib/window-manager';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';
import { DialogConfig } from 'renderer/system/dialog/dialogs';

export const InstallAppDialogConfig: (dialogProps: any) => DialogConfig = (
  dialogProps: any
) => ({
  component: (props) => (
    <InstallAppDialog
      ship={dialogProps.ship}
      title={dialogProps.title}
      desk={dialogProps.desk}
      {...props}
    />
  ),
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
        height: 200,
      },
      desktopDimensions
    ),
  }),
  static: true,
  hasCloseButton: false,
  unblurOnClose: true,
  noTitlebar: false,
});

const InstallAppDialogPresenter = ({
  ship,
  title,
  desk,
}: {
  ship: string;
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
          Install "{title}"?
        </Text.Custom>
        <Text.Custom fontSize={2} lineHeight="copy" variant="body">
          This application will be able to view and interact with your server's
          contents. Only install if you trust the developer.
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
            bazaarStore.installApp(ship, desk);
          }}
        >
          <Flex py={1}>Install</Flex>
        </Button.Primary>
      </Flex>
    </Flex>
  );
};

const InstallAppDialog = observer(InstallAppDialogPresenter);

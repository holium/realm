import { observer } from 'mobx-react';
import { normalizeBounds } from 'os/services/shell/lib/window-manager';
import { ShellActions } from 'renderer/logic/actions/shell';
import { DialogConfig } from 'renderer/system/dialog/dialogs';
import { Button, Flex, Text, TextInput, Icon } from '@holium/design-system';
import { Card } from '@holium/design-system/src/general/Card/Card';
import { useToggle } from 'renderer/logic/lib/useToggle';

export const CampfireAddParticipantDialogConfig: (
  dialogProps: any
) => DialogConfig = () => ({
  component: () => <CampfireAddParticipantDialog />,
  onClose: () => {
    ShellActions.closeDialog();
  },
  getWindowProps: (desktopDimensions) => ({
    appId: 'campfire-add-participant-dialog',
    title: 'Add Participant',
    zIndex: 13,
    type: 'dialog',
    bounds: normalizeBounds(
      {
        x: 0,
        y: 0,
        width: 400,
        height: 250,
      },
      desktopDimensions
    ),
  }),
  hasCloseButton: true,
  noTitlebar: false,
  draggable: false,
});

const CampfireAddParticipantDialogPresenter = () => {
  const copied = useToggle(false);
  return (
    <Flex flexDirection="column" width="100%" alignItems="stretch" gap={20}>
      <Text.Custom
        fontSize={5}
        lineHeight="24px"
        fontWeight={500}
        mb={2}
        variant="body"
      >
        Add Participant
      </Text.Custom>
      <Flex flexDirection="column" gap={30}>
        <Flex flexDirection="column" width="100%" gap={10}>
          <Text.H6>Urbit ID</Text.H6>
          <Flex gap={10} width="100%">
            <TextInput
              id="add-participant-id-input"
              name="AddParticipantInput"
              placeholder="Enter Urbit ID"
            />
            <Button.TextButton mr={3}>Invite</Button.TextButton>
          </Flex>
        </Flex>
        <Flex flexDirection="column" gap={10}>
          <Text.Caption>Or share this link for someone to join.</Text.Caption>
          <Card
            padding={2}
            justifyContent="space-between"
            style={{ borderRadius: '5px' }}
          >
            <Text.Caption>app+realm://~lomder-librun/xy21xao021</Text.Caption>
            {!copied ? <Icon name="Copy" /> : <Icon name="CheckCircle" />}
          </Card>
        </Flex>
      </Flex>
    </Flex>
  );
};

const CampfireAddParticipantDialog = observer(
  CampfireAddParticipantDialogPresenter
);

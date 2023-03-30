import { Flex, Text, TextInput, Button, Icon } from '@holium/design-system';
import { CampfireActions } from 'renderer/logic/actions/campfire';
import { useServices } from 'renderer/logic/store';
import { useRooms } from '../Rooms/useRooms';

export const Landing = () => {
  const { spaces, ship } = useServices();
  const roomsManager = useRooms(ship?.patp);
  const createRoom = (evt: any) => {
    // setLoading(true);
    // const { name, isPrivate } = form.actions.submit();
    const name = 'testing';
    const isPrivate = false;
    evt.stopPropagation();
    const spacePath =
      spaces.selected?.type !== 'our' ? spaces.selected?.path ?? '' : null;
    roomsManager?.createRoom(name, isPrivate ? 'private' : 'public', spacePath);
    CampfireActions.setView('video');
  };

  return (
    <Flex
      flexDirection="row"
      alignItems="center"
      justifyContent="space-around"
      flex={1}
    >
      <Flex
        flexDirection="column"
        gap={10}
        ml="auto"
        mr="auto"
        justifyContent="space-between"
      >
        <Text.Custom
          style={{
            fontStyle: 'normal',
            fontWeight: 500,
            fontSize: '35px',
            lineHeight: '41px',
            width: '244px',
            height: '41px',
          }}
        >
          Gather around
        </Text.Custom>
        <Text.Custom fontSize={'20px'} opacity={0.5} lineHeight={'24px'}>
          Join via a code or create a new campfire chat.
        </Text.Custom>
        <TextInput
          id="join-campfire"
          name="join-campfire"
          placeholder="Enter a code or @p"
          rightAdornment={<Button.TextButton>Join</Button.TextButton>}
          width={400}
          height={40}
        />
        <Flex flexDirection="row" gap={10} flex={0}>
          <Button.Base
            background="#F8E390"
            padding="4px 12px"
            justifyContent="center"
            alignItems="center"
            onClick={(evt: any) => {
              createRoom(evt);
              CampfireActions.setView('video');
            }}
            onKeyDown={(evt: any) => {
              if (evt.key === 'Enter' && form.computed.isValid) {
                createRoom(evt);
              }
            }}
          >
            <Icon name="AddVideo" size={20} />
            New Video
          </Button.Base>
          <Button.Base
            background="#F8E390"
            padding="4px 12px"
            justifyContent="center"
            alignItems="center"
          >
            <Icon name="Audio" size={20} />
            New Audio
          </Button.Base>
        </Flex>
        <Text.Caption opacity={0.5} marginBottom="auto" width={500}>
          Campfire calls are initiated via a star-hosted relay server. Once two
          peers are connected, the call is fully P2P. For more info click here.
        </Text.Caption>
      </Flex>
      <Flex margin="auto">
        <Icon name="Bonfire" overflow="visible" size={172} />
      </Flex>
    </Flex>
  );
};

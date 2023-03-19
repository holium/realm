import { Button, Icon, Text, TextInput } from '@holium/design-system';
import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';

const CampfirePresenter = () => {
  return (
    <Flex flex={1} flexDirection="row" alignItems="center">
      <Flex flexDirection="column" minHeight={0} gap={10}>
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
        />
        <Flex flexDirection="row" gap={10}>
          <Button.Base
            background="#F8E390"
            padding="4px 12px"
            justifyContent="center"
            alignItems="center"
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
      </Flex>
      <Text.Caption opacity={0.5} alignSelf="flex-end" mb={20}>
        Campfire calls are initiated via a star-hosted relay server. Once two
        peers are connected, the call is fully P2P. For more info click here.
      </Text.Caption>
      <Flex style={{ height: 172, width: 172 }}>
        <Icon name="Bonfire" overflow="visible" />
      </Flex>
    </Flex>
  );
};

export const Campfire = observer(CampfirePresenter);

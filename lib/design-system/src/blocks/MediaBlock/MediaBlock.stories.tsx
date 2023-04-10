import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from '../../general';
import { MediaBlock } from './MediaBlock';

export default {
  component: MediaBlock,
} as ComponentMeta<typeof MediaBlock>;

export const Default: ComponentStory<typeof MediaBlock> = () => (
  <Flex gap={16} flexDirection="column" width="500px" background="#FFFF" p={3}>
    <MediaBlock id="vid-1" mode="display" url="https://youtu.be/Sl7jz0qNbH0" />
    {/* Vimeo doesnt work so tests error state */}
    <MediaBlock id="vid-2" mode="display" url="https://vimeo.com/766555009" />
    <MediaBlock
      id="twitch-3"
      mode="display"
      url="https://www.twitch.tv/shroud"
    />
    <MediaBlock
      id="music-3"
      mode="display"
      height={100}
      url="https://soundcloud.com/andmeandyou/royksopp-impossible-feat-alison-goldfrapp-me-remix-1"
    />
    <MediaBlock
      id="spotify-1"
      mode="display"
      url="https://open.spotify.com/track/6MZDllGpedfIOyVSRa0Vu9?si=11ff03d8051a4af7"
    />
  </Flex>
);

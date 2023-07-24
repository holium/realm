import { useEffect, useRef, useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Card, CommButton, Flex } from '@holium/design-system/general';

import { Video } from './components/Video';

export default {
  component: Video,
} as ComponentMeta<typeof Video>;

const ourPeer = '~lomder-librun';

export const Default: ComponentStory<typeof Video> = () => {
  const [pinned, setPinned] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [mediaAccessStatus] = useState({
    mic: 'granted',
    camera: 'none',
    screen: 'none',
  });
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [hasVideo, setHasVideo] = useState(false);

  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      const videoWrapper = document.getElementById(
        `${ourPeer}-wrapper`
      ) as HTMLVideoElement;
      videoWrapper.style.display = 'block';
    } else {
      console.log('no ref');
    }
  }, []);

  return (
    <Flex
      position="relative"
      mt={4}
      p={3}
      gap={20}
      width="100%"
      height="700px"
      flexDirection="column"
    >
      <Flex position="relative" width="100%" height="700px">
        <Card
          zIndex={100}
          style={{
            position: 'absolute',
            height: 300,
            width: 250,
            bottom: 12,
            right: 12,
            display: isSettingsOpen ? 'inline-block' : 'none',
          }}
        ></Card>

        <Video
          id={ourPeer}
          innerRef={ref}
          canPin={true}
          isPinned={pinned}
          onPin={() => setPinned(!pinned)}
        />
      </Flex>
      <Flex
        position="relative"
        zIndex={100}
        row
        gap={12}
        flex={1}
        justifyContent="center"
        alignItems="center"
      >
        <CommButton
          tooltip="Microphone"
          icon={isMuted ? 'MicOff' : 'MicOn'}
          isDisabled={mediaAccessStatus.mic !== 'granted'}
          onClick={(evt) => {
            evt.stopPropagation();
            if (isMuted) {
              setIsMuted(false);
            } else {
              setIsMuted(true);
            }
          }}
        />
        <CommButton
          tooltip="Camera"
          icon={hasVideo ? 'VideoOn' : 'VideoOff'}
          isDisabled={mediaAccessStatus.camera !== 'granted'}
          onClick={() => {
            if (hasVideo) {
              setHasVideo(false);
            } else {
              setHasVideo(true);
            }
          }}
        />
        <CommButton
          tooltip="Screen share"
          icon={isScreenSharing ? 'ScreenSharing' : 'ScreenSharingOff'}
          isDisabled={mediaAccessStatus.screen !== 'granted'}
          onClick={() => {
            if (isScreenSharing) {
              setIsScreenSharing(false);
            } else {
              setIsScreenSharing(true);
            }
          }}
        />
        <CommButton
          tooltip={null}
          size={22}
          icon="AudioControls"
          customBg={isSettingsOpen ? 'input' : undefined}
          onClick={() => {
            if (isSettingsOpen) {
              setIsSettingsOpen(false);
            } else {
              setIsSettingsOpen(true);
            }
          }}
        />
      </Flex>
    </Flex>
  );
};

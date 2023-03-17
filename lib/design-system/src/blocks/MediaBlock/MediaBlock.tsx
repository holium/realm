import { FC, useEffect, useMemo, useState } from 'react';
import Spotify from 'react-spotify-embed';
import ReactPlayer from 'react-player/lazy';
import { Flex, Icon, isSpotifyLink, Text } from '../..';
import { BlockProps, Block } from '../Block/Block';
import styled from 'styled-components';

const MediaWrapper = styled(Flex)`
  position: relative;
  height: fit-content;
  width: 100%;
  .react-player-hide-cursor {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    cursor: none !important;
    z-index: 100;
    pointer-events: auto;
  }
`;

type MediaBlockProps = {
  url: string;
  height?: number;
} & BlockProps;

export const MediaBlock: FC<MediaBlockProps> = (props: MediaBlockProps) => {
  const { url, height = 230, onLoaded, ...rest } = props;

  const [isError, setIsError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const isSpotify = useMemo(() => isSpotifyLink(url), [url]);
  let heightOverride = height;

  if (isSpotify) {
    heightOverride = 80;
    const width = 300;
    return (
      <MediaWrapper
        {...rest}
        height={heightOverride + 12}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ opacity: 0.2 }}
        onAnimationComplete={() => {
          onLoaded && onLoaded();
        }}
      >
        <Spotify link={url} width={width} height={heightOverride} />
      </MediaWrapper>
    );
  }
  return (
    <Block {...rest}>
      <MediaWrapper>
        {!isReady && !isError && (
          <Flex
            isSkeleton
            position="absolute"
            top="0"
            bottom="0"
            left="0"
            right="0"
          />
        )}
        {isError ? (
          <Flex
            gap={12}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height={heightOverride}
            width="100%"
          >
            <Icon name="Error" size={30} opacity={0.5} />
            <Text.Body ml={2} opacity={0.5}>
              Sorry, this media cannot be played
            </Text.Body>
          </Flex>
        ) : (
          <ReactPlayer
            url={url}
            controls
            className={'react-player-iframe'}
            onReady={() => {
              setIsReady(true);
              onLoaded && onLoaded();
            }}
            width="100%"
            height={heightOverride}
            onError={() => {
              setIsError(true);
            }}
            style={{
              borderRadius: '4px',
              overflow: 'hidden',
              cursor: 'none',
            }}
            config={{
              youtube: {
                playerVars: { showinfo: 1 },
              },
            }}
          />
        )}
        {/* <div
          className="react-player-hide-cursor"
        ></div> */}
      </MediaWrapper>
    </Block>
  );
};

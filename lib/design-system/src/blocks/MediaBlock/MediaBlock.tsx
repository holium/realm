import { useMemo, useState } from 'react';
import ReactPlayer from 'react-player';
import styled from 'styled-components';

import { Flex, Icon, Text } from '../../../general';
import { isSoundcloudLink, isSpotifyLink } from '../../util/links';
import { Block, BlockProps } from '../Block/Block';

type MediaBlockProps = {
  url: string;
  height?: number;
} & BlockProps;

export const MediaBlock = ({
  url,
  height = 230,
  onLoaded,
  ...rest
}: MediaBlockProps) => {
  const [isError, setIsError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const isSpotify = useMemo(() => isSpotifyLink(url), [url]);
  const isSoundcloud = useMemo(() => isSoundcloudLink(url), [url]);
  let heightOverride = height;

  if (isSpotify) {
    heightOverride = 80;
    const width = 300;
    const spotifyLink = new URL(url);
    return (
      <MediaWrapper
        {...rest}
        height={heightOverride + 12}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ opacity: 0.2 }}
      >
        <webview
          id={rest.id}
          src={`https://open.spotify.com/embed${spotifyLink.pathname}`}
          style={{
            borderRadius: '4px',
            overflow: 'hidden',
            width: width,
            height: heightOverride,
          }}
        />
      </MediaWrapper>
    );
  }
  if (isSoundcloud) {
    heightOverride = 230;
    const width = 300;
    return (
      <MediaWrapper
        {...rest}
        height={heightOverride + 12}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ opacity: 0.2 }}
      >
        <webview
          id={rest.id}
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
            url
          )}&visual=true&buying=false&liking=false&download=false&sharing=false&show_comments=false&show_playcount=false&callback=true`}
          style={{
            borderRadius: '4px',
            overflow: 'hidden',
            width: width,
            height: heightOverride,
          }}
        />
      </MediaWrapper>
    );
  }
  return (
    <Block {...rest} display="block">
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
            id={rest.id}
            url={url}
            controls
            className="react-player-hide-cursor"
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
            }}
            config={{
              youtube: {
                playerVars: { showinfo: 1 },
              },
              file: {
                attributes: {
                  id: rest.id,
                  controlsList: 'nodownload noplaybackrate',
                  disablePictureInPicture: true,
                  'x-webkit-airplay': 'allow',
                },
              },
            }}
          />
        )}
      </MediaWrapper>
    </Block>
  );
};

const MediaWrapper = styled(Flex)`
  position: relative;
  height: fit-content;
  width: 100%;
  min-width: 250px;
`;

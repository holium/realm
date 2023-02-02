import { FC, useState } from 'react';
import Spotify from 'react-spotify-embed';
import ReactPlayer from 'react-player';
import { Flex, Icon, isSpotifyLink, Text } from '../..';
import { BlockProps, Block } from '../Block/Block';
import styled from 'styled-components';

const MediaWrapper = styled(Flex)`
  position: relative;
  width: 100%;
`;

type MediaBlockProps = {
  url: string;
  height?: number;
} & BlockProps;

export const MediaBlock: FC<MediaBlockProps> = (props: MediaBlockProps) => {
  const { url, height = 300, ...rest } = props;
  // TODO if error, render as basic link
  const [isError, setIsError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  if (isSpotifyLink(url)) {
    return <Spotify link={url} wide />;
  }
  return (
    <Block {...rest}>
      <MediaWrapper>
        {!isReady && !isError && (
          <Flex
            skeleton
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
            height={`${height}px`}
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
            onReady={() => {
              setIsReady(true);
            }}
            width="100%"
            height={`${height}px`}
            onError={(err) => {
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
            }}
          />
        )}
      </MediaWrapper>
    </Block>
  );
};

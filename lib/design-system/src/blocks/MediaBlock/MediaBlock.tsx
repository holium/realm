import { FC, useState } from 'react';
import Spotify from 'react-spotify-embed';
import ReactPlayer from 'react-player';
import { Flex, Icon, Text } from '../..';
import { BlockProps, Block } from '../Block/Block';
import { parseMediaType } from '../../util/links';
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

  const { mediaType, linkType } = parseMediaType(url);
  console.log('mediaType', mediaType, linkType);

  return <Block {...rest}>{renderMediaBlock(url, height)}</Block>;
};

export const renderMediaBlock = (url: string, height: number) => {
  const isSpotify = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:open\.)?(?:spotify\.com\/)(album|track|artist|playlist)\/(\w+)/
  );

  if (isSpotify) {
    return <Spotify link={url} wide />;
  }
  // TODO if error, render as basic link
  const [isError, setIsError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  return (
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
  );
};

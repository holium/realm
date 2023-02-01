import { FC, useState } from 'react';
import Spotify from 'react-spotify-embed';
import ReactPlayer from 'react-player';
import { Flex, Icon, Text } from '../..';
import { BlockProps, Block } from '../Block/Block';

type MediaBlockProps = {
  url: string;
  height?: number;
} & BlockProps;

export const MediaBlock: FC<MediaBlockProps> = (props: MediaBlockProps) => {
  const { url, height = 300, ...rest } = props;

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
  return (
    <Flex width="100%" position="relative">
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
          width="100%"
          height={`${height}px`}
          fallback={<div>Sorry, this media cannot be played</div>}
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
    </Flex>
  );
};

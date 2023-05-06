import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

import { Box, Flex, skeletonStyle, Text } from '../../general';
import { Bookmark } from '../../os/Bookmark/Bookmark';
import { parseMediaType } from '../../util/links';
import { Block, BlockProps } from '../Block/Block';
import { ImageBlock } from '../ImageBlock/ImageBlock';
import { MediaBlock } from '../MediaBlock/MediaBlock';
import { TweetBlock } from './TweetBlock';
import {
  extractOGData,
  fetchOGData,
  LINK_PREVIEW_HEIGHT,
  LinkPreviewType,
  RAW_LINK_HEIGHT,
} from './util';

const LinkTitle = styled(Text.Anchor)`
  overflow: hidden;
  line-height: 1.7rem;
  height: 1.6rem;
`;

const LinkDescription = styled(Text.Custom)`
  overflow: hidden;
  height: 1rem;
`;

const LinkImage = styled(motion.img)<{ isSkeleton?: boolean }>`
  width: 100%;
  height: 170px;
  object-fit: cover;
  border-radius: 4px;
  background: rgba(var(--rlm-window-rgba));
  ${({ isSkeleton }) => isSkeleton && skeletonStyle}
`;

type LinkBlockProps = {
  link: string;
  by: string;
  metadata?: any;
  containerWidth?: number;
  onLinkLoaded: () => void;
} & BlockProps;

export type LinkType = 'opengraph' | 'url';
type MediaType = 'twitter' | 'media' | 'image';
export type LinkBlockType = LinkType | MediaType;

export const LinkBlock = ({
  id,
  link,
  by,
  containerWidth,
  metadata = {},
  onLinkLoaded,
  ...rest
}: LinkBlockProps) => {
  const [openGraph, setOpenGraph] = useState<LinkPreviewType | null>(
    metadata.ogData ? JSON.parse(metadata.ogData) : null
  );
  const [linkBlockType, setLinkBlockType] = useState<LinkBlockType>('url');

  useEffect(() => {
    if (!metadata.ogData && !metadata.height) {
      const { linkType } = parseMediaType(link);
      if (linkType !== 'link') {
        return setLinkBlockType(linkType);
      }
      if (!openGraph && linkBlockType === 'opengraph') {
        fetchOGData(link).then(({ linkType: detectedLinkType, data }) => {
          setLinkBlockType(detectedLinkType);
          if (data) {
            setOpenGraph(extractOGData(data));
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    onLinkLoaded();
  }, [openGraph]);

  let description = openGraph?.ogDescription || '';

  // TODO make twitter height dynamic
  if (metadata.linkType === 'twitter' || linkBlockType === 'twitter') {
    let height = 300;
    let width = (typeof rest.width === 'number' && rest.width) || 320;
    if (metadata.width) {
      width = parseInt(metadata.width);
      height = parseInt(metadata.height);
    }
    // if (width < 400) {
    //   width = 320;
    // }
    return (
      <TweetBlock
        id={id}
        variant={rest.mode === 'embed' ? 'content' : 'default'}
        link={link}
        {...rest}
        width={width}
        height={height}
        onTweetLoad={onLinkLoaded}
      />
    );
  }

  if (linkBlockType === 'media') {
    if (typeof rest.height === 'string') {
      // strip out non-numeric characters
      if (rest.height.includes('px')) {
        rest.height = parseInt(rest.height.replace('px', ''));
      }
      // convert rem to px
      else rest.height = parseInt(rest.height.replace('rem', '')) * 16;
    }
    const width = containerWidth ? containerWidth * 0.9 : 320;
    return (
      <MediaBlock
        id={`media-${link}`}
        mode="embed"
        variant="content"
        url={link}
        width={width as number}
        height={rest.height as number}
        onLoaded={onLinkLoaded}
      />
    );
  }

  if (linkBlockType === 'image') {
    return (
      <ImageBlock
        id={`image-${link}`}
        mode="embed"
        by={by}
        image={link}
        width={rest.width || 'fit-content'}
        height={rest.height}
      />
    );
  }

  if (
    metadata.linkType === 'url' ||
    !metadata.ogData ||
    (metadata.ogData && !openGraph?.ogTitle)
  ) {
    const width = containerWidth ? containerWidth - 12 : 320;
    return (
      <Box id={id} height={RAW_LINK_HEIGHT}>
        <Block id={id} {...rest} height={24} width={width - 4}>
          <Bookmark
            id={id}
            url={link}
            title={link}
            width={width - 24}
            onNavigate={(url: string) => {
              window.open(url, '_blank');
            }}
          />
        </Block>
      </Box>
    );
  }

  const ogHasURL = openGraph && openGraph.ogUrl;
  // 254px in rem is 15rem
  if (!ogHasURL) {
    const width = containerWidth ? containerWidth - 12 : 320;
    return (
      <Box height={RAW_LINK_HEIGHT} id={id}>
        <Block id="loader" height={24} width={width - 4}>
          <Box isSkeleton height={'1.875rem'} width={width - 4}></Box>
        </Block>
      </Box>
    );
  }
  return (
    <Block id={id} {...rest} height={LINK_PREVIEW_HEIGHT}>
      <LinkImage
        id={id}
        src={openGraph?.ogImage}
        alt={openGraph?.ogTitle}
        onError={() => {
          // todo: if the image fails to load, set the image to error image
        }}
      />
      <Flex id={id} mb="0.25rem" width="100%" flexDirection="column">
        <LinkTitle
          id={id}
          truncate
          isSkeleton={!ogHasURL}
          fontSize={2}
          fontWeight={500}
          width={containerWidth ? containerWidth - 20 : 'inherit'}
          onClick={(evt: React.MouseEvent<HTMLAnchorElement>) => {
            evt.stopPropagation();
            window.open(openGraph?.ogUrl, '_blank');
          }}
        >
          {openGraph?.ogTitle}
        </LinkTitle>
        <LinkDescription
          id={id}
          truncate
          isSkeleton={!ogHasURL}
          fontSize={1}
          opacity={0.7}
          width={containerWidth ? containerWidth - 20 : 'calc(100% - 16px)'}
        >
          {description}
        </LinkDescription>
      </Flex>
      <Flex
        id={id}
        className="block-footer"
        flex={1}
        justifyContent="space-between"
        width="100%"
      >
        <Flex
          id={id}
          flexDirection="row"
          gap={4}
          justifyContent="space-between"
          alignItems="center"
          width="50%"
        >
          <Text.Anchor
            id={id}
            isSkeleton={!ogHasURL}
            fontSize={0}
            opacity={0.5}
            onClick={(evt: React.MouseEvent<HTMLAnchorElement>) => {
              evt.stopPropagation();
              if (ogHasURL) {
                const origin = new URL(openGraph.ogUrl).origin;
                window.open(origin, '_blank');
              }
            }}
          >
            {openGraph?.ogSiteName ||
              (ogHasURL && new URL(openGraph.ogUrl).hostname)}
          </Text.Anchor>
        </Flex>

        <Text.Custom
          id={id}
          truncate
          width="50%"
          textAlign="right"
          className="block-author"
          noSelection
          fontSize={0}
        >
          {by}
        </Text.Custom>
      </Flex>
    </Block>
  );
};

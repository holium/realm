import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

import { Box, Flex, skeletonStyle, Text } from '../../../general';
import { parseMediaType } from '../../util/links';
import { Block, BlockProps } from '../Block/Block';
import { ImageBlock } from '../ImageBlock/ImageBlock';
import { MediaBlock } from '../MediaBlock/MediaBlock';
import { TweetBlock } from './TweetBlock';
import {
  extractOGData,
  fetchOGData,
  LinkPreviewType,
  RAW_LINK_HEIGHT,
} from './util';

const InlineLink = styled(Text.Anchor)`
  color: rgba(var(--rlm-accent-rgba), 1);
`;

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

const parseUrl = (url: string, defaultUrl: string) => {
  let result: string;
  try {
    const urlObject = new URL(url);
    result = urlObject.toString();
  } catch (e) {
    result = defaultUrl;
  }
  return result;
};

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

  const description = openGraph?.ogDescription || '';

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
    if (!link.match(/^http/i)) {
      link = 'https://' + link;
    }
    return (
      <InlineLink
        id={id}
        href={link}
        title={link}
        target="_blank"
        rel="noreferrer"
      >
        {link}
      </InlineLink>
    );
  }

  const ogHasURL = openGraph && openGraph.ogUrl;
  const ogHasImage = openGraph && openGraph.ogImage;
  // 254px in rem is 15rem
  // show the loader if the image or ogUrl is missing, but NOT if both are the empty string. In that case, it's just an og object with missing info, so display as best we can
  if (
    !ogHasURL &&
    !ogHasImage &&
    !(openGraph?.ogUrl === '' && openGraph?.ogImage === '')
  ) {
    const width = containerWidth ? containerWidth - 12 : 320;
    return (
      <Box height={RAW_LINK_HEIGHT} id={id}>
        <Block id="loader" width={width - 4}>
          <Box isSkeleton height={'1.875rem'} width={width - 4}></Box>
        </Block>
      </Box>
    );
  }
  // @patrick - only use ogUrl if it can be parsed using URL
  const ogOrLink = ogHasURL ? parseUrl(openGraph?.ogUrl, link) : link;
  let sitename: string;
  try {
    sitename = openGraph?.ogSiteName || new URL(ogOrLink).hostname;
  } catch {
    sitename = ogOrLink;
  }
  return (
    <Block id={id} {...rest}>
      {ogHasImage && (
        <LinkImage
          id={id}
          src={openGraph?.ogImage}
          alt={openGraph?.ogTitle}
          onError={() => {
            // todo: if the image fails to load, set the image to error image
          }}
        />
      )}
      <Flex id={id} width="100%" flexDirection="column">
        <LinkTitle
          id={id}
          truncate
          isSkeleton={!openGraph?.ogTitle}
          fontSize={2}
          fontWeight={500}
          width={containerWidth ? containerWidth - 20 : 'inherit'}
          onClick={(evt: React.MouseEvent<HTMLAnchorElement>) => {
            evt.stopPropagation();
            window.open(ogOrLink, '_blank');
          }}
        >
          {openGraph?.ogTitle}
        </LinkTitle>
        {openGraph?.ogDescription && (
          <LinkDescription
            id={id}
            truncate
            isSkeleton={!openGraph?.ogDescription}
            fontSize={1}
            opacity={0.7}
            width={containerWidth ? containerWidth - 20 : 'calc(100% - 16px)'}
          >
            {description}
          </LinkDescription>
        )}
      </Flex>
      <Flex
        id={id}
        className="block-footer"
        minHeight="16px !important"
        flex={1}
        justifyContent="space-between"
        width="100%"
      >
        <Flex
          id={id}
          flex={1}
          flexDirection="row"
          gap={4}
          justifyContent="space-between"
          alignItems="center"
        >
          <Text.Anchor
            id={id}
            isSkeleton={false}
            fontSize={0}
            opacity={0.5}
            onClick={(evt: React.MouseEvent<HTMLAnchorElement>) => {
              evt.stopPropagation();
              const origin = new URL(ogOrLink).origin;
              window.open(origin, '_blank');
            }}
            style={{
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {sitename}
          </Text.Anchor>
        </Flex>
        <Flex flex={1} justifyContent="flex-end" alignItems="center">
          <Text.Custom
            id={id}
            truncate
            textAlign="right"
            className="block-author"
            noSelection
            fontSize={0}
          >
            {by}
          </Text.Custom>
        </Flex>
      </Flex>
    </Block>
  );
};

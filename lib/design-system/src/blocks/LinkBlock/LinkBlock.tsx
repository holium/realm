import { useEffect, useLayoutEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Flex,
  skeletonStyle,
  Text,
  Bookmark,
  MediaBlock,
  ImageBlock,
  Box,
} from '../..';
import { BlockProps, Block } from '../Block/Block';
import { parseMediaType } from '../../util/links';
import { TweetBlock } from './TweetBlock';

const OPENGRAPH_API = 'https://api.holium.live/v1/opengraph/opengraph';

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

type OpenGraphType = {
  twitterCard: string; // 'summary_large_image'
  twitterSite: string; // '@verge';
  ogSiteName: string; //'The Verge';
  ogTitle: string; //'Spotify is laying off 6 percent of its global workforce, CEO announces';
  ogDescription: string; // 'Impacting almost 600 employees.';
  ogUrl: string; //'https://www.theverge.com/2023/1/23/23567333/spotify-layoffs-daniel-ek-cost-cutting';
  ogType: string; //'article';
  articlePublishedTime: string; //'2023-01-23T12:30:00.726Z';
  articleModifiedTime: string; //'2023-01-23T12:30:00.726Z';
  author: string; //'Jon Porter';
  ogImage: {
    url: string; //'https://cdn.vox-cdn.com/thumbor/TN-dCJzSsrzVGl4x4SgbBQJ1ajU=/0x0:2040x1360/1200x628/filters:focal(1020x680:1021x681)/cdn.vox-cdn.com/uploads/chorus_asset/file/23951394/STK088_VRG_Illo_N_Barclay_1_spotify.jpg';
    width: number | null;
    height: number | null;
    type: string | null;
  };
  requestUrl: string; //'https://www.theverge.com/2023/1/23/23567333/spotify-layoffs-daniel-ek-cost-cutting';
  success: boolean; // true
};

type LinkBlockProps = {
  link: string;
  by: string;
  metadata?: any;
  containerWidth?: number;
  onLinkLoaded: () => void;
} & BlockProps;

type LinkType = 'opengraph' | 'url';
type MediaType = 'twitter' | 'media' | 'image';
type LinkBlockType = LinkType | MediaType;

const nonOpengraphLinkTypes = ['twitter', 'media', 'image'];
const rawLinkHeight = 100;

export const LinkBlock = ({
  link,
  by,
  containerWidth,
  onLinkLoaded,
  ...rest
}: LinkBlockProps) => {
  const [openGraph, setOpenGraph] = useState<OpenGraphType | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [linkBlockType, setLinkBlockType] =
    useState<LinkBlockType>('opengraph');

  useEffect(() => {
    const { linkType } = parseMediaType(link);
    if (linkType !== 'link') {
      return setLinkBlockType(linkType);
    }
    if (!openGraph && linkBlockType === 'opengraph') {
      fetch(`${OPENGRAPH_API}?url=${encodeURIComponent(link)}`)
        .then(async (res) => {
          if (res.status === 200) {
            const data = await res.json();
            if (!data || data.error) {
              setLinkBlockType('url');
              return;
            } else {
              setOpenGraph(data);
            }
          } else {
            setLinkBlockType('url');
          }
        })
        .catch((err) => {
          console.error(err);
          setLinkBlockType('url');
        });
    }
  }, []);

  useLayoutEffect(() => {
    onLinkLoaded;
  }, [imgLoaded]);

  let description = openGraph?.ogDescription || '';

  if (linkBlockType === 'url') {
    const width = containerWidth ? containerWidth - 12 : 320;

    return (
      <Block {...rest} width={width} onLoaded={onLinkLoaded}>
        <Bookmark
          url={link}
          title={link}
          width={width - 16}
          onNavigate={(url: string) => {
            window.open(url, '_blank');
          }}
        />
      </Block>
    );
  }
  if (linkBlockType === 'twitter') {
    let width = rest.width || 320;
    if (width < 400) {
      width = 320;
    }
    return (
      <TweetBlock
        variant={rest.mode === 'embed' ? 'content' : 'default'}
        link={link}
        {...rest}
        width={width}
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
        onImageLoaded={onLinkLoaded}
      />
    );
  }

  const ogHasURL = openGraph && openGraph.ogUrl;
  // 254px in rem is 15.875rem
  return (
    <Box onLayoutMeasure={onLinkLoaded}>
      <Block {...rest} height="15.875rem">
        <LinkImage
          isSkeleton={!ogHasURL || !imgLoaded}
          src={openGraph?.ogImage?.url}
          alt={openGraph?.ogTitle}
          onError={() => {
            // onLoaded && onLoaded();
          }}
          onLoad={() => {
            setImgLoaded(true);
          }}
        />
        <Flex mb="0.25rem" width="100%" flexDirection="column">
          <LinkTitle
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
          className="block-footer"
          flex={1}
          justifyContent="space-between"
          width="100%"
        >
          <Flex
            flexDirection="row"
            gap={4}
            justifyContent="space-between"
            alignItems="center"
            width="50%"
          >
            <Text.Anchor
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
    </Box>
  );
};

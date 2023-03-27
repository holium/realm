import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Flex, skeletonStyle, Text, Bookmark } from '../..';
import { BlockProps, Block } from '../Block/Block';
import { isTwitterLink } from '../../util/links';
import { TweetBlock } from './TweetBlock';

const OPENGRAPH_API = 'https://api.holium.live/v1/opengraph/opengraph';

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
} & BlockProps;

type LinkType = 'opengraph' | 'url' | 'twitter';

export const LinkBlock = ({ link, by, ...rest }: LinkBlockProps) => {
  const [openGraph, setOpenGraph] = useState<OpenGraphType | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [linkType, setLinkType] = useState<LinkType>('opengraph');

  useEffect(() => {
    if (isTwitterLink(link)) {
      setLinkType('twitter');
    }
    if (!openGraph && linkType === 'opengraph') {
      fetch(`${OPENGRAPH_API}?url=${encodeURIComponent(link)}`)
        .then(async (res) => {
          if (res.status === 200) {
            const data = await res.json();
            if (!data || data.error) setLinkType('url');
            setOpenGraph(data);
          } else {
            setLinkType('url');
          }
        })
        .catch((err) => {
          console.error(err);
          setLinkType('url');
        });
    }
  }, []);

  let description = openGraph?.ogDescription || '';
  if (description.length > 99) {
    description = description.substring(0, 100) + '...';
  }

  if (linkType === 'url') {
    return (
      <Block {...rest}>
        <Bookmark
          url={link}
          title={link}
          width={320}
          onNavigate={(url: string) => {
            window.open(url, '_blank');
          }}
        />
      </Block>
    );
  }
  if (linkType === 'twitter') {
    let width = rest.width || 400;
    if (width < 400) {
      width = 400;
    }
    return (
      <TweetBlock
        variant={rest.mode === 'embed' ? 'content' : 'default'}
        link={link}
        {...rest}
        width={width}
      />
    );
  }

  return (
    <Block {...rest}>
      <LinkImage
        isSkeleton={!openGraph || !imgLoaded}
        src={openGraph?.ogImage.url}
        alt={openGraph?.ogTitle}
        onError={() => {}}
        onLoad={() => setImgLoaded(true)}
      />
      <Flex width="100%" gap={2} flexDirection="column">
        <Text.Anchor
          isSkeleton={!openGraph}
          fontSize={2}
          fontWeight={500}
          width={rest.width || 'inherit'}
          onClick={(evt: React.MouseEvent<HTMLAnchorElement>) => {
            evt.stopPropagation();
            window.open(openGraph?.ogUrl, '_blank');
          }}
        >
          {openGraph?.ogTitle}
        </Text.Anchor>
        <Text.Custom
          isSkeleton={!openGraph}
          fontSize={1}
          opacity={0.7}
          width={rest.width || 'inherit'}
        >
          {description}
        </Text.Custom>
      </Flex>
      <Flex
        className="block-footer"
        flex={1}
        justifyContent="space-between"
        width="inherit"
      >
        <Flex
          flexDirection="row"
          gap={4}
          justifyContent="space-between"
          alignItems="center"
          width="50%"
        >
          <Text.Anchor
            isSkeleton={!openGraph}
            fontSize={0}
            opacity={0.5}
            onClick={(evt: React.MouseEvent<HTMLAnchorElement>) => {
              evt.stopPropagation();
              if (openGraph?.ogUrl) {
                const origin = new URL(openGraph.ogUrl).origin;
                window.open(origin, '_blank');
              }
            }}
          >
            {openGraph?.ogSiteName ||
              (openGraph && new URL(openGraph.ogUrl).hostname)}
          </Text.Anchor>
        </Flex>

        <Text.Custom className="block-author" noSelection fontSize={0}>
          {by}
        </Text.Custom>
      </Flex>
    </Block>
  );
};

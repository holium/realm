import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Flex, Text } from '../..';
import { BlockProps, Block } from '../Block/Block';

const OPENGRAPH_API = 'https://opengraph.holium.live/opengraph';

const LinkImage = styled(motion.img)`
  width: 100%;
  height: 170px;
  object-fit: cover;
  border-radius: 4px;
  background: var(--rlm-window-color);
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

export const LinkBlock: FC<LinkBlockProps> = (props: LinkBlockProps) => {
  const { link, by, metadata, ...rest } = props;
  const [openGraph, setOpenGraph] = useState<OpenGraphType | null>(null);

  useEffect(() => {
    if (!openGraph) {
      fetch(`${OPENGRAPH_API}?url=${encodeURIComponent(link)}`)
        .then(async (res) => {
          const data = await res.json();
          setOpenGraph(data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  let description = openGraph?.ogDescription || '';
  if (description.length > 99) {
    description = description.substring(0, 100) + '...';
  }

  return (
    <Block {...rest}>
      <LinkImage src={openGraph?.ogImage.url} />
      <Flex gap={2} flexDirection="column">
        <Text.Anchor
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
        <Text.Custom fontSize={1} opacity={0.7} width={rest.width || 'inherit'}>
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
        >
          <Text.Anchor
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

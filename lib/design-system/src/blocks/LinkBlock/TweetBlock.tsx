import { FC, useMemo, useState } from 'react';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import styled, { css } from 'styled-components';
import { skeletonStyle } from '../..';
import { BlockStyle, BlockProps } from '../Block/Block';

type TweetWrapperProps = { skeleton: boolean };

const TweetWrapper = styled(BlockStyle)<TweetWrapperProps>`
  min-height: 250px;
  > div {
    /* This is the wrapper of the embed */
    width: 100%;
  }
  .twitter-tweet {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
  }
  ${({ skeleton }: TweetWrapperProps) =>
    skeleton &&
    css`
      ${skeletonStyle}
      border-radius: 12px;
      width: calc(100% - 8px) !important;
      height: calc(100% - 8px) !important;
      padding: 4px;
      min-height: 250px;
    `}
`;

type TweetBlockProps = {
  link: string;
} & BlockProps;

export const TweetBlock: FC<TweetBlockProps> = (props: TweetBlockProps) => {
  const { id, link, ...rest } = props;
  let tweetEmbed: any = null;
  const [tweetLoaded, setTweetLoaded] = useState(false);
  return useMemo(() => {
    if (link.includes('status')) {
      const tweetId = link.split('status/')[1].split('?')[0];
      tweetEmbed = (
        <TwitterTweetEmbed
          onLoad={() => {
            console.log('TweetBlock: tweet loaded');
            setTweetLoaded(true);
          }}
          tweetId={tweetId}
          options={{
            dnt: true,
            width: rest.width,
          }}
        />
      );
    } else {
      console.error('TweetBlock: link is not a tweet link');
    }

    return (
      <TweetWrapper skeleton={!tweetLoaded} id={id} {...rest}>
        {tweetEmbed}
      </TweetWrapper>
    );
  }, [link, tweetLoaded]);
};
